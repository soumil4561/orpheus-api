import server from './app'
import { logger, setContext } from '@orpheus/logger'
import { identityDatasource } from '@/datasource'

setContext('identity-service')

try {
  await identityDatasource.connect()
  logger.info('Connected to Postgres successfully')
} catch (err) {
  logger.error('Failed to connect to Postgres:', err)
  // Optionally do not start the server at all
  // process.exit(1)
}

await new Promise<void>((resolve) =>
  server.listen({ port: 3001 }, () => {
    logger.info('Identity service is running on port 3001')
    resolve()
  })
)

const exitHandler = () => {
  logger.info('Shutting down...')
  identityDatasource.close().finally(() => {
    server.close(() => {
      logger.info('HTTP server closed')
      process.exit(1)
    })
  })
}

const unexpectedErrorHandler = (error: Error) => {
  logger.error(error)
  exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
  logger.info('SIGTERM received')
  if (server) {
    server.close()
  }
})

process.on('SIGINT', () => {
  logger.info('SIGINT received')
  exitHandler()
})
