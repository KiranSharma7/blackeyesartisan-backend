import {
  AbstractNotificationProviderService,
  MedusaError
} from '@medusajs/framework/utils';
import {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
  Logger
} from '@medusajs/framework/types';
import { CreateEmailOptions, Resend, ErrorResponse } from 'resend';
import { orderPlacedEmail } from './emails/order-placed';
import { userInvitedEmail } from './emails/user-invited';
import { passwordResetEmail } from './emails/password-reset';

// Template identifiers
enum Templates {
  ORDER_PLACED = 'order-placed',
  USER_INVITED = 'user-invited',
  PASSWORD_RESET = 'password-reset'
}

// Subject lines mapping
const TEMPLATE_SUBJECTS: Record<Templates, string> = {
  [Templates.ORDER_PLACED]: 'Order Confirmation',
  [Templates.USER_INVITED]: "You're Invited!",
  [Templates.PASSWORD_RESET]: 'Reset Your Password'
};

// Template function type
type TemplateFunction = (props: unknown) => React.ReactNode;

// Template registry - cached for performance
const templates: Readonly<Record<Templates, TemplateFunction>> = {
  [Templates.ORDER_PLACED]: orderPlacedEmail,
  [Templates.USER_INVITED]: userInvitedEmail,
  [Templates.PASSWORD_RESET]: passwordResetEmail
};

type ResendOptions = {
  api_key: string;
  from: string;
  html_templates?: Record<
    string,
    {
      subject?: string;
      content: string;
    }
  >;
  // Retry configuration
  max_retries?: number;
  retry_delay_ms?: number;
};

type InjectedDependencies = {
  logger: Logger;
};

// Retry configuration
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

// Utility function for delay
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Check if error is retryable (rate limits, temporary failures)
const isRetryableError = (error: ErrorResponse): boolean => {
  const retryableStatusCodes = [429, 500, 502, 503, 504];
  // Resend error structure may have statusCode or name
  const statusCode = (error as any).statusCode;
  if (statusCode && retryableStatusCodes.includes(statusCode)) {
    return true;
  }
  // Rate limit errors
  if (error.name === 'rate_limit_exceeded') {
    return true;
  }
  return false;
};

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = 'notification-resend';

  private readonly resendClient: Resend;
  private readonly options: ResendOptions;
  private readonly logger: Logger;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super();
    this.resendClient = new Resend(options.api_key);
    this.options = options;
    this.logger = logger;
    this.maxRetries = options.max_retries ?? DEFAULT_MAX_RETRIES;
    this.retryDelayMs = options.retry_delay_ms ?? DEFAULT_RETRY_DELAY_MS;
  }

  static validateOptions(options: Record<string, unknown>): void {
    if (!options.api_key || typeof options.api_key !== 'string') {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `api_key` is required in the provider's options."
      );
    }
    if (!options.from || typeof options.from !== 'string') {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `from` is required in the provider's options."
      );
    }
  }

  private getTemplate(
    templateName: Templates
  ): string | TemplateFunction | null {
    // Check custom HTML templates first
    const customTemplate = this.options.html_templates?.[templateName];
    if (customTemplate) {
      return customTemplate.content;
    }

    // Fall back to React templates
    return templates[templateName] ?? null;
  }

  private getTemplateSubject(templateName: Templates): string {
    // Check custom subject first
    const customSubject = this.options.html_templates?.[templateName]?.subject;
    if (customSubject) {
      return customSubject;
    }

    return TEMPLATE_SUBJECTS[templateName] ?? 'New Email';
  }

  private async sendWithRetry(
    emailOptions: CreateEmailOptions,
    attempt = 1
  ): Promise<{ id: string } | null> {
    const { data, error } = await this.resendClient.emails.send(emailOptions);

    if (error) {
      const shouldRetry = isRetryableError(error) && attempt < this.maxRetries;

      if (shouldRetry) {
        const delayMs = this.retryDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
        this.logger.warn(
          `Email send failed (attempt ${attempt}/${this.maxRetries}), retrying in ${delayMs}ms...`,
          { error: error.message }
        );
        await delay(delayMs);
        return this.sendWithRetry(emailOptions, attempt + 1);
      }

      this.logger.error(
        `Failed to send email after ${attempt} attempt(s)`,
        error
      );
      return null;
    }

    if (!data) {
      this.logger.error('Failed to send email: no data returned');
      return null;
    }

    return { id: data.id };
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const startTime = Date.now();
    const templateName = notification.template as Templates;

    // Validate recipient
    if (!notification.to || typeof notification.to !== 'string') {
      this.logger.error('Invalid recipient email address', {
        to: notification.to
      });
      return {};
    }

    const template = this.getTemplate(templateName);

    if (!template) {
      this.logger.error(
        `Email template not found: ${notification.template}. Valid templates: ${Object.values(Templates).join(', ')}`
      );
      return {};
    }

    const subject = this.getTemplateSubject(templateName);

    // Build email options
    const emailOptions: CreateEmailOptions =
      typeof template === 'string'
        ? {
            from: this.options.from,
            to: [notification.to],
            subject,
            html: template
          }
        : {
            from: this.options.from,
            to: [notification.to],
            subject,
            react: template(notification.data)
          };

    // Send with retry logic
    const result = await this.sendWithRetry(emailOptions);

    // Log performance metrics
    const duration = Date.now() - startTime;
    if (result) {
      this.logger.info(`Email sent successfully in ${duration}ms`, {
        template: templateName,
        to: notification.to,
        id: result.id
      });
      return result;
    }

    return {};
  }
}

export default ResendNotificationProviderService;