import { Modules } from '@medusajs/framework/utils';
import { createStep, StepResponse, StepExecutionContext } from '@medusajs/framework/workflows-sdk';
import { CreateNotificationDTO, INotificationModuleService, Logger } from '@medusajs/framework/types';

type CompensationInput = { notificationIds: string[] };

export const sendNotificationStep = createStep(
  'send-notification',
  async (data: CreateNotificationDTO[], { container }: StepExecutionContext) => {
    const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION);
    const notification = await notificationModuleService.createNotifications(data);
    // Pass notification IDs for potential compensation
    const notificationIds = Array.isArray(notification)
      ? notification.map((n) => n.id)
      : [(notification as { id: string }).id];
    return new StepResponse(notification, { notificationIds });
  },
  async ({ notificationIds }: CompensationInput, { container }: StepExecutionContext) => {
    // Compensation: Log failed notification attempt
    // Note: Notifications typically can't be "unsent", but we log for debugging
    const logger: Logger = container.resolve('logger');
    logger.warn(`Workflow rolled back. Notification IDs that were sent: ${notificationIds.join(', ')}`);
  }
);
