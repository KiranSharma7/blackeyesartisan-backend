export default ({ env }) => {
  const isProduction = env('NODE_ENV') === 'production';

  // Check if S3/DigitalOcean Spaces is configured
  const isS3Configured =
    env('DO_SPACE_ACCESS_KEY') && env('DO_SPACE_SECRET_KEY');

  return {
    upload: {
      config: {
        provider: isS3Configured ? 'aws-s3' : 'local',
        providerOptions: isS3Configured
          ? {
              rootPath: env('DO_SPACE_PATH', ''),
              credentials: {
                accessKeyId: env('DO_SPACE_ACCESS_KEY'),
                secretAccessKey: env('DO_SPACE_SECRET_KEY')
              },
              region: env('DO_SPACE_REGION', 'nyc3'),
              endpoint: env('DO_SPACE_ENDPOINT'),
              params: {
                Bucket: env('DO_SPACE_BUCKET'),
                // Cache control for uploaded assets (1 year)
                CacheControl: 'max-age=31536000'
              }
            }
          : {},
        actionOptions: {
          upload: {
            // ACL for uploaded files
            ACL: isProduction ? 'public-read' : undefined
          },
          uploadStream: {
            ACL: isProduction ? 'public-read' : undefined
          },
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
