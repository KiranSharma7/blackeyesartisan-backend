import path from 'path';

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const isProduction = env('NODE_ENV') === 'production';

  // Optimized pool configuration based on environment
  const productionPoolConfig = {
    min: env.int('DATABASE_POOL_MIN', 2),
    max: env.int('DATABASE_POOL_MAX', 20),
    // Connection lifecycle settings
    acquireTimeoutMillis: env.int('DATABASE_ACQUIRE_TIMEOUT', 30000),
    createTimeoutMillis: env.int('DATABASE_CREATE_TIMEOUT', 30000),
    destroyTimeoutMillis: env.int('DATABASE_DESTROY_TIMEOUT', 5000),
    idleTimeoutMillis: env.int('DATABASE_IDLE_TIMEOUT', 30000),
    reapIntervalMillis: env.int('DATABASE_REAP_INTERVAL', 1000),
    createRetryIntervalMillis: env.int('DATABASE_CREATE_RETRY_INTERVAL', 200),
    // Propagate create error for better debugging
    propagateCreateError: false
  };

  const developmentPoolConfig = {
    min: env.int('DATABASE_POOL_MIN', 1),
    max: env.int('DATABASE_POOL_MAX', 5)
  };

  const poolConfig = isProduction ? productionPoolConfig : developmentPoolConfig;

  // SSL configuration helper
  const getSSLConfig = () => {
    if (!env.bool('DATABASE_SSL', false)) {
      return false;
    }

    return {
      key: env('DATABASE_SSL_KEY', undefined),
      cert: env('DATABASE_SSL_CERT', undefined),
      ca: env('DATABASE_SSL_CA', undefined),
      capath: env('DATABASE_SSL_CAPATH', undefined),
      cipher: env('DATABASE_SSL_CIPHER', undefined),
      rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true)
    };
  };

  const connections = {
    mysql: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: getSSLConfig(),
        // MySQL performance optimizations
        charset: 'utf8mb4',
        timezone: 'UTC',
        supportBigNumbers: true,
        bigNumberStrings: true
      },
      pool: poolConfig
    },
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: getSSLConfig(),
        schema: env('DATABASE_SCHEMA', 'public'),
        // PostgreSQL performance optimizations
        application_name: 'blackeyesartisan-strapi',
        // Statement timeout to prevent long-running queries (30 seconds)
        statement_timeout: isProduction
          ? env.int('DATABASE_STATEMENT_TIMEOUT', 30000)
          : undefined
      },
      pool: poolConfig,
      // Additional Knex settings for PostgreSQL
      searchPath: ['public']
    },
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          '..',
          '..',
          env('DATABASE_FILENAME', '.tmp/data.db')
        )
      },
      useNullAsDefault: true,
      // SQLite optimizations for development
      pool: {
        min: 1,
        max: 1,
        afterCreate: (conn, done) => {
          // Enable WAL mode for better concurrent access
          conn.run('PRAGMA journal_mode = WAL;', done);
        }
      }
    }
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
      // Enable debug logging in development
      debug: env.bool('DATABASE_DEBUG', false)
    }
  };
};
