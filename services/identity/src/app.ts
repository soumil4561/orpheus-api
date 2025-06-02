import http from 'http'
import express from 'express'
import cors from 'cors'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'

const app = express()
const httpServer = http.createServer(app)

interface RequestContext {
  token?: string
}

const typeDefs = `
    type Query {
        hello: String
    }
    `

const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
  },
}

const server = new ApolloServer<RequestContext>({
  typeDefs,
  resolvers,
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
