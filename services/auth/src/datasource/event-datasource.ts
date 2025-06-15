import { NatsEventDataSource } from '@orpheus/datasource-provider'
import { eventDataSourceContext } from '@/context'

export class EventDataSource extends NatsEventDataSource {
  constructor() {
    super(eventDataSourceContext)
  }
}
