import http from 'http'

import 'dotenv/config'
import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import { schema } from '@/schemas/gql'

const app = express()
const httpServer = http.createServer(app)
interface RequestContext {
  token?: string
}

const server = new ApolloServer<RequestContext>({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
})

await server.start()

app.get('/', (req, res) => {
  res.send('Welcome to the Identity Service!')
})

app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  })
)

export default httpServer
