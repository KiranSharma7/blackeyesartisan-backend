export default ({ env }) => {
  const isProduction = env('NODE_ENV') === 'production';

  return {
    rest: {
      // Pagination settings
      defaultLimit: env.int('API_DEFAULT_LIMIT', 25),
      maxLimit: env.int('API_MAX_LIMIT', 100),
      // Include count by default for pagination
      withCount: true,
      // Depth limit for populate to prevent over-fetching
      defaultPopulate: isProduction ? undefined : '*'
    },
    // Response transformer settings
    responses: {
      // Remove empty fields from response (reduces payload size)
      privateAttributes: ['createdBy', 'updatedBy'],
      // Transform sensitive data
      transform: {
        // Remove internal timestamps in production
        timestamps: !isProduction
      }
    }
  };
};
