import { logger, env } from '@/context'
import { BaseExpressServerContext } from '@orpheus/server-core'
import router from '@/routes/v1'

const allowedOrigins =
  env.NODE_ENV === 'dev'
    ? ['*']
    : env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) ?? []

export const serverContext: BaseExpressServerContext = {
  serviceName: env.SERVICE_NAME,
  port: env.PORT,
  env: env.NODE_ENV,
  logger,
  routes: [
    {
      path: `/api/${env.API_VER}`,
      router: router,
    },
  ],
  healthCheck: async () => {
    // Perform DB or service ping check
    return true
  },
  onReady: () => {
    logger.info(`${env.SERVICE_NAME} is ready`)
  },
  onShutdown: () => {
    logger.info(`Cleanup before shutting down ${env.SERVICE_NAME}`)
  },
  corsOptions: {
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true)
      } else {
        return callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  },
  responseHeaders: {
    'X-Service-Version': '1.0.0',
  },
  enableMetrics: false,
}
