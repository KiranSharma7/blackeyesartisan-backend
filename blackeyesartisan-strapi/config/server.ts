export default ({ env }) => {
  const isProduction = env('NODE_ENV') === 'production';

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    url: env('PUBLIC_URL', ''),
    app: {
      keys: env.array('APP_KEYS')
    },
    // Proxy configuration for production (behind nginx/load balancer)
    proxy: isProduction,
    // Socket configuration for better handling of concurrent connections
    socket: {
      // Keep-alive settings
      timeout: env.int('SOCKET_TIMEOUT', 60000),
      // Increase max listeners for production
      maxHeadersCount: 100
    },
    // Webhooks configuration
    webhooks: {
      // Populate relations in webhook payload (use sparingly for performance)
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
      // Default headers for outgoing webhooks
      defaultHeaders: {}
    },
    // Directories configuration
    dirs: {
      public: './public'
    },
    // Transfer plugin (for data import/export)
    transfer: {
      // Remote transfer settings
      remote: {
        enabled: !isProduction // Disable remote transfer in production
      }
    },
    // Cron jobs configuration
    cron: {
      enabled: env.bool('CRON_ENABLED', true),
      // Cron tasks can be defined here
      tasks: {}
    }
  };
};
