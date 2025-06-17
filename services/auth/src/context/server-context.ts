import { logger, env } from '@/context'
import { BaseExpressServerContext } from '@orpheus/server-core'
import router from '@/routes/v1'
import { cacheDatasoure, eventDatasource } from '@/datasource'

const allowedOrigins =
  env.NODE_ENV === 'dev'
    ? ['*']
    : (env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) ?? [])

async function onReady() {
  logger.info('Connecting to event bus...')
  await eventDatasource.connect()
  logger.info('Connected to event bus ')
  logger.info('Connecting to cache memory...')
  await cacheDatasoure.connect()
  logger.info('Connected to cache memory')
  logger.info(`${env.SERVICE_NAME} is ready`)
}

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
  onReady,
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
