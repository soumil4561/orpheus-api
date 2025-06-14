import http from 'http'
import express, { Router, Request, Response } from 'express'
import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet'
import { logger } from '@orpheus/logger'
import { globalApiErrorHandler } from '@orpheus/error-utils'
import * as promClient from 'prom-client'
import { status } from 'http-status'

import {
  HEALTH_FAIL_MSG,
  HEALTH_SUCCESS_MSG,
  INTERNAL_SERVER_ERROR_MSG,
  NOT_FOUND_MSG,
} from './constants'

interface BaseExpressServerContext {
  serviceName: string
  port: number
  env: string
  logger: typeof logger
  middlewares?: express.RequestHandler[]
  routes?: {
    path: string
    router: Router
  }[]
  healthCheck?: () => Promise<boolean>
  errorHandler?: express.ErrorRequestHandler
  onReady?: () => void | Promise<void>
  onShutdown?: () => void | Promise<void>
  enableMetrics?: boolean
  responseHeaders?: Record<string, string>
  corsOptions?: cors.CorsOptions
  tags?: Record<string, string | number>
}

export class ExpressRestServer<TContext extends BaseExpressServerContext> {
  private httpServer!: http.Server
  private _context!: TContext
  private app!: express.Express

  async initialize(context: TContext) {
    this._context = context
    this.app = express()
    this._context.logger.info('Starting initialization')

    //standard middleware setup
    this.app.use(cors(this._context.corsOptions))
    this.app.use(compression())
    this.app.use(helmet())
    this.app.use(express.json())

    //external service provided response headers
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

    //service provided middeware setup
    this._context.middlewares?.forEach((middleware) => {
      this.app.use(middleware)
    })

    //specific routes implementation

    //health route
    if (this._context.healthCheck) {
      this.app.get('/healthz', async (_: Request, res: Response) => {
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

    //metric route
    if (this._context.enableMetrics) {
      promClient.collectDefaultMetrics()
      this.app.get('/metrics', async (_, res) => {
        res.set('Content-Type', promClient.register.contentType)
        res.end(await promClient.register.metrics())
      })
    }

    //service provided route setup
    this._context.routes?.forEach((route) => {
      this.app.use(route.path, route.router)
    })

    this.app.use((req, res) => {
      res.status(status.NOT_FOUND).json({
        success: false,
        data: null,
        message: NOT_FOUND_MSG,
      })
    })

    //global error handler
    this.app.use(globalApiErrorHandler)

    this._context.logger.info('Server Initialization Complete')
  }

  async setup() {
    this.httpServer = http.createServer(this.app)

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
        `${this._context.serviceName} server listening on port ${this._context.port}`
      )
    })

    // Setup graceful shutdown listeners
    this.setupProcessHandlers()
  }

  async shutdown() {
    this._context.logger.info('Shutting down server...')
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
          this._context.logger.error('Error closing server:', err)
          return reject(err)
        }
        this._context.logger.info('HTTP server closed')
        resolve()
      })
    })
  }

  delete() {
    this._context.logger.info('Cleaning up server references')
    // Optional: Reset references for testing or hot reload
    this.app = undefined as unknown as express.Express
    this.httpServer = undefined as unknown as http.Server
    this._context = undefined as unknown as TContext
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
