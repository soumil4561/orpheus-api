import { ConnectionOptions as NatsConnectionOptions } from 'nats'
import { DatasourceContext } from './datasource.type'

export type SupportedBrokers =
  | 'nats'
  | 'kafka'
  | 'redis'
  | 'sns'
  | 'sqs'
  | 'pubsub'
  | 'mock'

export interface BaseEventContext<TOptions = Record<string, unknown>>
  extends DatasourceContext {
  broker: SupportedBrokers
  clientId: string
  options?: TOptions
}

export interface NatsEventContext
  extends BaseEventContext<NatsConnectionOptions> {
  broker: 'nats'
  options?: NatsConnectionOptions
}

// You can add more later:
export interface KafkaEventContext
  extends BaseEventContext<{
    brokers: string[]
    clientId: string
  }> {
  broker: 'kafka'
  options?: {
    brokers: string[]
    clientId: string
  }
}

export type EventDataSourceContext =
  | NatsEventContext
  | KafkaEventContext
  | BaseEventContext
