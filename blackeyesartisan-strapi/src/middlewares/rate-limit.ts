/**
 * Rate limiting middleware for Strapi v5
 * Provides in-memory rate limiting with configurable windows and limits
 */

interface RateLimitConfig {
  enabled?: boolean;
  max?: number;
  window?: number;
  delayAfter?: number;
  timeWait?: number;
  headers?: boolean;
  whitelist?: string[];
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const DEFAULT_CONFIG: Required<RateLimitConfig> = {
  enabled: true,
  max: 100,
  window: 60 * 1000, // 1 minute
  delayAfter: 80,
  timeWait: 1000,
  headers: true,
  whitelist: [],
  message: 'Too many requests, please try again later.'
};

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Cleanup every minute

const getClientIdentifier = (ctx: any): string => {
  // Try to get real IP from proxy headers first
  const forwarded = ctx.request.headers['x-forwarded-for'];
  if (forwarded) {
    return typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
  }

  const realIp = ctx.request.headers['x-real-ip'];
  if (realIp) {
    return typeof realIp === 'string' ? realIp : realIp[0];
  }

  return ctx.request.ip || 'unknown';
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default (config: RateLimitConfig, { strapi }) => {
  const options: Required<RateLimitConfig> = { ...DEFAULT_CONFIG, ...config };

  return async (ctx: any, next: () => Promise<void>) => {
    // Skip if disabled
    if (!options.enabled) {
      return next();
    }

    const clientId = getClientIdentifier(ctx);

    // Skip whitelisted IPs
    if (options.whitelist.includes(clientId)) {
      return next();
    }

    const now = Date.now();
    let entry = rateLimitStore.get(clientId);

    // Initialize or reset entry
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + options.window
      };
      rateLimitStore.set(clientId, entry);
    } else {
      entry.count++;
    }

    // Set rate limit headers
    if (options.headers) {
      ctx.set('X-RateLimit-Limit', options.max.toString());
      ctx.set(
        'X-RateLimit-Remaining',
        Math.max(0, options.max - entry.count).toString()
      );
      ctx.set(
        'X-RateLimit-Reset',
        Math.ceil(entry.resetTime / 1000).toString()
      );
    }

    // Check if over limit
    if (entry.count > options.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      ctx.set('Retry-After', retryAfter.toString());
      ctx.status = 429;
      ctx.body = {
        error: {
          status: 429,
          name: 'RateLimitError',
          message: options.message,
          details: {
            retryAfter
          }
        }
      };

      // Log rate limit hit
      strapi.log.warn(`Rate limit exceeded for ${clientId}`);
      return;
    }

    // Apply delay if approaching limit
    if (entry.count > options.delayAfter) {
      const delayMs = Math.min(
        options.timeWait * (entry.count - options.delayAfter),
        5000 // Max 5 second delay
      );
      await delay(delayMs);
    }

    return next();
  };
};
