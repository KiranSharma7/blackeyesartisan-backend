const isProduction = process.env.NODE_ENV === 'production';

export default [
  // Error handling first
  'strapi::errors',

  // Security middleware with enhanced CSP
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'blob:',
            'data:',
            'cdn.jsdelivr.net',
            'strapi.io',
            process.env.SPACE_URL
          ].filter(Boolean),
          'media-src': [
            "'self'",
            'blob:',
            'data:',
            'strapi.io',
            process.env.SPACE_URL
          ].filter(Boolean),
          'script-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
          'frame-ancestors': ["'self'"],
          upgradeInsecureRequests: isProduction ? true : null
        }
      },
      // Additional security headers
      xssFilter: true,
      frameguard: {
        action: 'deny'
      },
      hsts: isProduction
        ? {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
          }
        : false,
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
      }
    }
  },

  // CORS configuration
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
        'X-Requested-With',
        'Cache-Control'
      ],
      origin: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : ['http://localhost:3000'],
      // Expose rate limit headers to client
      expose: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset'
      ]
    }
  },

  // Compression middleware for better performance
  {
    name: 'strapi::compression',
    config: {
      enabled: isProduction,
      options: {
        // Compression level (1-9, higher = more compression but slower)
        level: 6,
        // Minimum size to compress (bytes)
        threshold: 1024,
        // Don't compress if client doesn't support it
        filter: (req, res) => {
          if (req.headers['x-no-compression']) {
            return false;
          }
          return true;
        }
      }
    }
  },

  // Custom powered-by header (hide Strapi version)
  {
    name: 'strapi::poweredBy',
    config: {
      poweredBy: 'BlackEyesArtisan API'
    }
  },

  // Logger with request timing
  {
    name: 'strapi::logger',
    config: {
      level: isProduction ? 'warn' : 'debug',
      exposeInContext: true,
      requests: true
    }
  },

  // Query parser with optimized settings
  {
    name: 'strapi::query',
    config: {
      // Limit query depth to prevent abuse
      depth: 10,
      // Maximum number of parameters
      parameterLimit: 100
    }
  },

  // Body parser with size limits
  {
    name: 'strapi::body',
    config: {
      // JSON body size limit
      jsonLimit: '2mb',
      // Form body size limit
      formLimit: '10mb',
      // Text body size limit
      textLimit: '256kb',
      // Enable strict mode (only accepts arrays and objects)
      strict: true
    }
  },

  // Session configuration
  {
    name: 'strapi::session',
    config: {
      // Use secure cookies in production
      secure: isProduction,
      // HTTP-only cookies
      httpOnly: true,
      // SameSite attribute
      sameSite: 'lax'
    }
  },

  // Favicon
  'strapi::favicon',

  // Static file serving with caching
  {
    name: 'strapi::public',
    config: {
      // Cache static files for 1 day
      maxAge: isProduction ? 86400000 : 0
    }
  },

  // Rate limiting middleware (custom global config)
  {
    name: 'global::rate-limit',
    config: {
      enabled: isProduction,
      // Requests per window
      max: 100,
      // Time window in milliseconds (1 minute)
      window: 60 * 1000,
      // Delay between requests when limit is reached
      delayAfter: 80,
      // Time to delay in ms
      timeWait: 1000,
      // Headers to include
      headers: true
    }
  }
];
