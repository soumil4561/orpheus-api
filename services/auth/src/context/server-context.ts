import { logger, env } from '@/context'

export const serverContext = {
  serviceName: env.SERVICE_NAME,
  port: env.PORT,
  env: env.NODE_ENV,
  logger,
  routes: [],
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
    origin: ['*'],
    credentials: true,
  },
  responseHeaders: {
    'X-Service-Version': '1.0.0',
  },
  enableMetrics: false,
}
