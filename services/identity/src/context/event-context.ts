import { NatsEventContext } from '@orpheus/datasource-provider'
import { env, logger } from '@/context'

export const eventDataSourceContext: NatsEventContext = {
  name: env.SERVICE_NAME,
  broker: 'nats',
  clientId: env.NATS_CLIENT_ID,
  logger,
  options: {
    servers: env.NATS_SERVER_LIST,
    name: env.SERVICE_NAME,
    debug: env.NATS_CONSOLE_DEBUG,
    reconnect: true,
    maxReconnectAttempts: env.NATS_MAX_RECONNECTS ?? 10,
    // port: env.NATS_PORT ?? 4222,
    user: env.NATS_BROKER_USER ?? 'user',
    pass: env.NATS_BROKER_PASS ?? 'pass',
  },
}
