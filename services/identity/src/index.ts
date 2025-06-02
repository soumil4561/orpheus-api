import server from './app'
import { logger, setContext } from '@orpheus/logger'

setContext('identity-service')

await new Promise<void>((resolve) =>
  server.listen({ port: 3001 }, () => {
    logger.info('Identity service is running on port 3001')
    resolve()
  })
)

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server shtting down gracefully')
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
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
