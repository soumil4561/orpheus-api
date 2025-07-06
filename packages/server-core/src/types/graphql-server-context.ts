import type { CorsOptions } from 'cors'
import type { RequestHandler, ErrorRequestHandler } from 'express'
import type { GraphQLSchema } from 'graphql'
import type { ApolloServerPlugin } from '@apollo/server'
import type { ExpressContextFunctionArgument } from '@as-integrations/express5'
import type { BaseServerContext } from './base'

export interface BaseGraphQLServerContext extends BaseServerContext {
  // Apollo server-specific
  schema: GraphQLSchema
  plugins?: ApolloServerPlugin[]

  // Express-specific (since you're using expressMiddleware)
  middlewares?: RequestHandler[]
  corsOptions?: CorsOptions
  errorHandler?: ErrorRequestHandler

  responseHeaders?: Record<string, string>

  // Context builder (Apollo's version, per request)
  contextBuilder?: (
    params: ExpressContextFunctionArgument
  ) => Promise<Record<string, unknown>>

  // Optional GET /
  rootHandler?: RequestHandler

  // Health check
  healthCheck?: () => Promise<boolean>

  // Path mount point (defaults to `/graphql`)
  graphqlPath?: string
}
