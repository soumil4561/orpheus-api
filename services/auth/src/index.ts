// index.ts
import 'dotenv/config'
import { ExpressRestServer } from '@orpheus/server-core'
import { serverContext, logger } from '@/context'

const server = new ExpressRestServer()

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
