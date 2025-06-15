import { connect, JSONCodec, NatsConnection, Subscription } from 'nats'
import { EventDataSource } from './event.datasource'
import { EventDataSourceContext, NatsEventContext } from '@/types'

const json = JSONCodec()

export class NatsEventDataSource extends EventDataSource {
  private connection!: NatsConnection
  private subscriptions: Subscription[] = []

  constructor(context: EventDataSourceContext) {
    super(context)
  }

  async connect(): Promise<void> {
    // Type narrowing to ensure TS knows we are working with NATS
    if (this.context.broker !== 'nats') {
      throw new Error(`[NATS] Invalid broker: ${this.context.broker}`)
    }

    const { clientId, options } = this.context as NatsEventContext

    this.connection = await connect({
      ...options,
      name: clientId,
    })

    this.context.logger?.info(`[NATS] Connected as ${clientId}`)
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.drain()
      this.context.logger?.info('[NATS] Connection drained and closed.')
    }
  }

  async publish<T extends object>(subject: string, payload: T): Promise<void> {
    this.connection.publish(subject, json.encode(payload))
  }

  async subscribe<T extends object>(
    subject: string,
    handler: (payload: T) => Promise<void>
  ): Promise<void> {
    const subscription = this.connection.subscribe(subject)
    this.subscriptions.push(subscription)
    ;(async () => {
      for await (const msg of subscription) {
        const data = json.decode(msg.data) as T
        await handler(data)
      }
    })()
  }

  async isHealthy(): Promise<boolean> {
    return this.connection.isClosed() === false
  }
}
