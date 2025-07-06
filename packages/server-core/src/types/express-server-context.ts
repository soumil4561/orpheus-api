import express from 'express'
import cors from 'cors'
import { BaseServerContext } from './base'

export interface BaseExpressServerContext extends BaseServerContext {
  middlewares?: express.RequestHandler[]
  routes?: {
    path: string
    router: express.Router
  }[]
  healthCheck?: () => Promise<boolean>
  errorHandler?: express.ErrorRequestHandler
  responseHeaders?: Record<string, string>
  corsOptions?: cors.CorsOptions
}
