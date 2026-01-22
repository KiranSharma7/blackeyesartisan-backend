import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: {
      status: HealthStatus;
      latency_ms?: number;
      error?: string;
    };
    cache?: {
      status: HealthStatus;
      latency_ms?: number;
      error?: string;
    };
  };
}

const startTime = Date.now();

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: { status: 'healthy' }
    }
  };

  // Database health check
  try {
    const dbStart = Date.now();
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    // Simple query to check database connectivity
    await query.graph({
      entity: 'region',
      fields: ['id'],
      pagination: { take: 1 }
    });

    response.checks.database = {
      status: 'healthy',
      latency_ms: Date.now() - dbStart
    };
  } catch (error) {
    response.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database connection failed'
    };
    response.status = 'unhealthy';
  }

  // Cache health check (if Redis is configured)
  if (process.env.REDIS_URL) {
    try {
      const cacheStart = Date.now();
      // Attempt to resolve cache service
      const cacheService = req.scope.resolve(ContainerRegistrationKeys.CACHE);
      if (cacheService) {
        // Simple cache operation
        await cacheService.get('health-check-key');
        response.checks.cache = {
          status: 'healthy',
          latency_ms: Date.now() - cacheStart
        };
      }
    } catch (error) {
      response.checks.cache = {
        status: 'degraded',
        error: error instanceof Error ? error.message : 'Cache service unavailable'
      };
      // Cache being down is degraded, not unhealthy
      if (response.status === 'healthy') {
        response.status = 'degraded';
      }
    }
  }

  // Set appropriate status code
  const statusCode = response.status === 'healthy' ? 200 : response.status === 'degraded' ? 200 : 503;

  // No caching for health checks
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.status(statusCode).json(response);
};
