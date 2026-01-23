import {
  defineMiddlewares,
  type MiddlewareRoute,
  type MedusaRequest,
  type MedusaResponse,
  type MedusaNextFunction
} from '@medusajs/framework/http';
import { storeSearchRoutesMiddlewares } from './store/search/middlewares';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = IS_PRODUCTION ? 100 : 1000;

/**
 * Simple in-memory rate limiter.
 *
 * WARNING: This implementation uses in-memory storage and will NOT work correctly
 * in distributed/multi-process environments (e.g., PM2 cluster mode, multiple containers).
 *
 * For production deployments with multiple instances, consider:
 * 1. Using a Redis-based rate limiter (e.g., rate-limiter-flexible with Redis)
 * 2. Using a reverse proxy rate limiter (e.g., Nginx, Cloudflare)
 * 3. Using an API gateway with built-in rate limiting
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const rateLimitMiddleware = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const clientIp =
    req.ip || (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) || 'unknown';
  const now = Date.now();

  let clientData = requestCounts.get(clientIp);

  if (!clientData || now > clientData.resetTime) {
    clientData = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    requestCounts.set(clientIp, clientData);
  } else {
    clientData.count++;
  }

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX_REQUESTS - clientData.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));

  if (clientData.count > RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({
      message: 'Too many requests, please try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
    return;
  }

  next();
};

// Security headers middleware
const securityHeadersMiddleware = async (
  _req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Remove server fingerprint
  res.removeHeader('X-Powered-By');

  next();
};

// Cache control middleware for GET requests
const cacheControlMiddleware = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  if (req.method === 'GET') {
    // Default cache headers - can be overridden by specific routes
    const cacheMaxAge = IS_PRODUCTION ? 60 : 0; // 1 minute in production
    res.setHeader('Cache-Control', `public, max-age=${cacheMaxAge}, stale-while-revalidate=${cacheMaxAge * 2}`);
  }
  next();
};

// Request logging middleware for performance monitoring
const requestTimingMiddleware = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    // Log slow requests (> 1000ms) for debugging
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
    }
  });

  next();
};

// Clean up old rate limit entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Global middleware for all routes
const globalMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/store/*',
    middlewares: [
      securityHeadersMiddleware,
      rateLimitMiddleware,
      cacheControlMiddleware,
      requestTimingMiddleware
    ]
  },
  {
    matcher: '/admin/*',
    middlewares: [
      securityHeadersMiddleware,
      requestTimingMiddleware
    ]
  }
];

export default defineMiddlewares([
  ...globalMiddlewares,
  ...storeSearchRoutesMiddlewares
]);
