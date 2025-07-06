import http from 'http'
import express from 'express'
import { ApolloServer, BaseContext } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@as-integrations/express5'
import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet'
import promClient from 'prom-client'

import { BaseGraphQLServerContext } from '@/types'
import {
  HEALTH_FAIL_MSG,
  HEALTH_SUCCESS_MSG,
  INTERNAL_SERVER_ERROR_MSG,
  NOT_FOUND_MSG,
} from '@/constants'
import status from 'http-status'

export class GraphQLSubgraphServer<TContext extends BaseGraphQLServerContext> {
  private app!: express.Express
  private httpServer!: http.Server
  private apolloServer!: ApolloServer<BaseContext>
  private _context!: TContext

  async initialize(context: TContext) {
    this._context = context
    this.app = express()
    this.httpServer = http.createServer(this.app)

    this._context.logger.info('Starting GraphQL Server Initialization')

    // Middleware setup
    this.app.use(cors(this._context.corsOptions))
    this.app.use(compression())
    this.app.use(helmet())
    this.app.use(express.json())

    // Set response headers
    if (this._context.responseHeaders) {
      this.app.use((_, res, next) => {
        Object.entries(this._context.responseHeaders!).forEach(
          ([key, value]) => {
            res.setHeader(key, value)
          }
        )
        next()
      })
    }

    // Custom middlewares
    this._context.middlewares?.forEach((middleware) => {
      this.app.use(middleware)
    })

    // Optional root GET /
    if (this._context.rootHandler) {
      this.app.get('/', this._context.rootHandler)
    }

    // Health check route
    if (this._context.healthCheck) {
      this.app.get('/healthz', async (_req, res) => {
        try {
          const healthy = await this._context.healthCheck!()
          res.status(healthy ? status.OK : status.SERVICE_UNAVAILABLE).json({
            success: healthy,
            data: null,
            message: healthy ? HEALTH_SUCCESS_MSG : HEALTH_FAIL_MSG,
          })
        } catch (error) {
          this._context.logger?.error('Health check failed:', error)
          res.status(status.INTERNAL_SERVER_ERROR).json({
            success: false,
            data: null,
            message: INTERNAL_SERVER_ERROR_MSG,
          })
        }
      })
    }

    // Metrics route
    if (this._context.enableMetrics) {
      promClient.collectDefaultMetrics()
      this.app.get('/metrics', async (_req, res) => {
        res.set('Content-Type', promClient.register.contentType)
        res.end(await promClient.register.metrics())
      })
    }

    // Apollo Server instantiation with automatic drain plugin injection
    this.apolloServer = new ApolloServer({
      schema: this._context.schema,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer }),
        ...(this._context.plugins ?? []),
      ],
    })

    await this.apolloServer.start()

    this.app.use(
      this._context.graphqlPath || '/graphql',
      expressMiddleware(this.apolloServer, {
        context: async ({ req, res }) => {
          return this._context.contextBuilder
            ? await this._context.contextBuilder({ req, res })
            : {}
        },
      })
    )

    //404 handler
    this.app.use((req, res) => {
      res.status(status.NOT_FOUND).json({
        success: false,
        data: null,
        message: NOT_FOUND_MSG,
      })
    })

    // Global error handler
    if (this._context.errorHandler) {
      this.app.use(this._context.errorHandler)
    }

    this._context.logger.info('GraphQL Server Initialization Complete')
  }

  async setup() {
    if (this._context.onReady) {
      try {
        await this._context.onReady()
        this._context.logger.info('onReady callback executed successfully')
      } catch (err) {
        this._context.logger.error('Error during onReady:', err)
      }
    }
  }

  async start() {
    await this.setup()

    this.httpServer.listen(this._context.port, () => {
      this._context.logger.info(
        `${this._context.serviceName} GraphQL server listening on port ${this._context.port}`
      )
    })

    this.setupProcessHandlers()
  }

  async shutdown() {
    this._context.logger.info('Shutting down GraphQL server...')
    try {
      await this.apolloServer.stop()
      this._context.logger.info('Apollo server stopped')
    } catch (err) {
      this._context.logger.error('Error stopping Apollo server:', err)
    }

    if (this._context.onShutdown) {
      try {
        await this._context.onShutdown()
        this._context.logger.info('onShutdown callback executed')
      } catch (err) {
        this._context.logger.error('Error during shutdown:', err)
      }
    }

    await new Promise<void>((resolve, reject) => {
      this.httpServer.close((err) => {
        if (err) {
          this._context.logger.error('Error closing HTTP server:', err)
          return reject(err)
        }
        this._context.logger.info('HTTP server closed')
        resolve()
      })
    })
  }

  private setupProcessHandlers() {
    const exitHandler = () => {
      this._context.logger.info('Exit signal received. Cleaning up...')
      this.shutdown()
        .then(() => {
          this._context.logger.info('Shutdown complete. Exiting.')
          process.exit(0)
        })
        .catch((err) => {
          this._context.logger.error('Forced exit due to error:', err)
          process.exit(1)
        })
    }

    const unexpectedErrorHandler = (error: Error) => {
      this._context.logger.error('Unexpected error occurred:', error)
      exitHandler()
    }

    process.on('uncaughtException', unexpectedErrorHandler)
    process.on('unhandledRejection', unexpectedErrorHandler)

    process.on('SIGTERM', () => {
      this._context.logger.info('SIGTERM received')
      exitHandler()
    })

    process.on('SIGINT', () => {
      this._context.logger.info('SIGINT received')
      exitHandler()
    })
  }
}
