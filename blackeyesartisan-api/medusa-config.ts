import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const dynamicModules: Record<string, any> = {};

// Stripe Payment Configuration
const stripeApiKey = process.env.STRIPE_API_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const isStripeConfigured = Boolean(stripeApiKey) && Boolean(stripeWebhookSecret);

if (isStripeConfigured) {
  console.log('Stripe API key and webhook secret found. Enabling payment module');
  dynamicModules[Modules.PAYMENT] = {
    resolve: '@medusajs/medusa/payment',
    options: {
      providers: [
        {
          resolve: '@medusajs/medusa/payment-stripe',
          id: 'stripe',
          options: {
            apiKey: stripeApiKey,
            webhookSecret: stripeWebhookSecret,
            capture: true
          }
        }
      ]
    }
  };
}

// Redis Configuration - Significantly improves API response times
const redisUrl = process.env.REDIS_URL;
if (redisUrl) {
  console.log('Redis URL found. Enabling Redis-based modules for improved performance');

  // Caching Module (replaces deprecated Cache Module in v2.11.0+)
  dynamicModules[Modules.CACHE] = {
    resolve: '@medusajs/medusa/cache-redis',
    options: {
      redisUrl,
      ttl: 60 * 60 * 24, // 24 hours default TTL
      namespace: 'blackeyesartisan'
    }
  };

  // Enable Redis-based event bus for distributed systems
  dynamicModules[Modules.EVENT_BUS] = {
    resolve: '@medusajs/medusa/event-bus-redis',
    options: {
      redisUrl
    }
  };

  // Enable Redis-based workflow engine for better job processing
  dynamicModules[Modules.WORKFLOW_ENGINE] = {
    resolve: '@medusajs/medusa/workflow-engine-redis',
    options: {
      redis: {
        redisUrl // Updated from deprecated 'url' property (v2.12.2+)
      }
    }
  };

  // Enable Redis-based locking for distributed environments
  dynamicModules[Modules.LOCKING] = {
    resolve: '@medusajs/medusa/locking',
    options: {
      providers: [
        {
          resolve: '@medusajs/medusa/locking-redis',
          id: 'locking-redis',
          is_default: true,
          options: {
            redisUrl
          }
        }
      ]
    }
  };
}

// Cloudinary File Storage Configuration
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  console.log('Cloudinary configured. Enabling Cloudinary file module');
  dynamicModules[Modules.FILE] = {
    resolve: '@medusajs/medusa/file',
    options: {
      providers: [
        {
          resolve: './src/modules/cloudinary-file',
          id: 'cloudinary',
          options: {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
            folder: 'blackeyesartisan' // Cloudinary folder for organization
          }
        }
      ]
    }
  };
}

const modules = {
  [Modules.NOTIFICATION]: {
    resolve: '@medusajs/medusa/notification',
    options: {
      providers: [
        {
          resolve: './src/modules/resend',
          id: 'resend',
          options: {
            channels: ['email'],
            api_key: process.env.RESEND_API_KEY,
            from: process.env.RESEND_FROM_EMAIL
          }
        }
      ]
    }
  },
  [Modules.INDEX]: {
    resolve: '@medusajs/index'
  }
};

module.exports = defineConfig({
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    disable: process.env.DISABLE_MEDUSA_ADMIN === 'true'
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Database connection pooling optimization
    databaseDriverOptions: IS_PRODUCTION
      ? {
          pool: {
            min: 2,
            max: 20,
            acquireTimeoutMillis: 30000,
            createTimeoutMillis: 30000,
            destroyTimeoutMillis: 5000,
            idleTimeoutMillis: 30000,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 100
          }
        }
      : undefined,
    databaseLogging: process.env.DATABASE_LOGGING === 'true',
    redisUrl: process.env.REDIS_URL,
    // Worker mode for background job processing
    workerMode: process.env.MEDUSA_WORKER_MODE as 'shared' | 'worker' | 'server' || 'shared',
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
      // Compression and performance
      compression: {
        enabled: true,
        level: 6,
        threshold: 1024 // Only compress responses > 1KB
      }
    }
  },
  modules: {
    ...dynamicModules,
    ...modules
  }
});
