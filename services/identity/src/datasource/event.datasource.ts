import { NatsEventDataSource } from '@orpheus/datasource-provider'
import { eventDataSourceContext } from '@/context'
import { userEventListeners } from '@/listeners'

export class EventDatasource extends NatsEventDataSource {
  constructor() {
    super(eventDataSourceContext)
  }

  registerEventHandlers() {
    userEventListeners(this)
  }
}
