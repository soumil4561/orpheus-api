import express, { Router } from 'express'
import cors from 'cors'
import { logger } from '@orpheus/logger'

export interface BaseExpressServerContext {
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
