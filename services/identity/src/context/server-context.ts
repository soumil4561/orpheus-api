import { logger, env } from '@/context'
import { BaseGraphQLServerContext } from '@orpheus/server-core'
import { schema } from '@/schemas/gql'
// import { cacheDatasource, dbDatasource, eventDatasource } from '@/datasource'
import { identityDatasource } from '@/datasource'

const allowedOrigins =
  env.NODE_ENV === 'dev'
    ? ['*']
    : (env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) ?? [])

async function onReady() {
  logger.info(`Connecting to datasources...`)
  await identityDatasource.connect()
  logger.info(`${env.SERVICE_NAME} is ready`)
}

export const serverContext: BaseGraphQLServerContext = {
  serviceName: env.SERVICE_NAME,
  port: env.PORT,
  env: env.NODE_ENV,
  logger,
  schema,
  graphqlPath: '/graphql',
  contextBuilder: async ({ req }) => {
    const token = req.headers.authorization || ''
    return { token }
  },
  healthCheck: async () => {
    // Optionally ping db, cache, etc.
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
  rootHandler: (req, res) => {
    res.send('Welcome to the Identity GraphQL Service!')
  },
}
