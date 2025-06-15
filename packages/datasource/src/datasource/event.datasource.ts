import { BaseDatasource } from './base'
import { EventDataSourceContext } from '@/types'

export abstract class EventDataSource extends BaseDatasource<EventDataSourceContext> {
  constructor(context: EventDataSourceContext) {
    super(context)
  }

  /** Establish a connection to the event broker */
  abstract connect(): Promise<void>

  /** Gracefully disconnect from the event broker */
  abstract disconnect(): Promise<void>

  /** Publish a message to a subject */
  abstract publish<T extends object>(subject: string, payload: T): Promise<void>

  /** Subscribe to a subject with a handler */
  abstract subscribe<T extends object>(
    subject: string,
    handler: (payload: T) => Promise<void>
  ): Promise<void>

  /** Health check for the broker connection */
  abstract isHealthy(): Promise<boolean>
}
