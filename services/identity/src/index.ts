import 'dotenv/config'
import { GraphQLSubgraphServer } from '@orpheus/server-core'
import { serverContext, logger } from '@/context'

const server = new GraphQLSubgraphServer()

async function main() {
  try {
    await server.initialize(serverContext)
    await server.start()
  } catch (err) {
    logger.error('Failed to start server:', err)
    process.exit(1)
  }
}

main()
