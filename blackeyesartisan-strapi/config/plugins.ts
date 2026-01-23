export default ({ env }) => {
  const isProduction = env('NODE_ENV') === 'production';

  // Check if Cloudinary is configured
  const isCloudinaryConfigured =
    env('CLOUDINARY_NAME') && env('CLOUDINARY_KEY') && env('CLOUDINARY_SECRET');

  return {
    upload: {
      config: {
        provider: isCloudinaryConfigured ? 'cloudinary' : 'local',
        providerOptions: isCloudinaryConfigured
          ? {
              cloud_name: env('CLOUDINARY_NAME'),
              api_key: env('CLOUDINARY_KEY'),
              api_secret: env('CLOUDINARY_SECRET')
            }
          : {},
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {}
        },
        // File size limits
        sizeLimit: env.int('UPLOAD_SIZE_LIMIT', 10 * 1024 * 1024), // 10MB default
        // Breakpoints for responsive images
        breakpoints: {
          xlarge: 1920,
          large: 1000,
          medium: 750,
          small: 500,
          xsmall: 64
        },
        // Security validation for uploaded files
        security: {
          allowedTypes: ['image/*', 'application/*', 'video/*', 'audio/*'],
          deniedTypes: ['application/x-sh', 'application/x-dosexec', 'application/x-executable']
        }
      }
    },
    // Users & Permissions plugin optimization
    'users-permissions': {
      config: {
        // JWT token settings
        jwt: {
          expiresIn: env('JWT_EXPIRES_IN', '7d')
        },
        // Rate limiting for auth endpoints
        ratelimit: {
          // Max login attempts before delay
          max: 5,
          // Delay in ms after max attempts
          interval: 60000
        }
      }
    },
    // Email plugin (if needed)
    email: {
      config: {
        provider: env('EMAIL_PROVIDER', 'sendmail'),
        providerOptions: {},
        settings: {
          defaultFrom: env('EMAIL_DEFAULT_FROM', 'noreply@blackeyesartisan.com'),
          defaultReplyTo: env('EMAIL_DEFAULT_REPLY_TO', 'support@blackeyesartisan.com')
        }
      }
    }
  };
};
