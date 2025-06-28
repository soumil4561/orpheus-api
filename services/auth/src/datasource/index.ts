import { EventDataSource } from './event-datasource'
import { CacheDatasource } from './cache-datasource'
import { DbDataSource } from './db-datasource'

export const eventDatasource = new EventDataSource()
export const cacheDatasoure = new CacheDatasource()
export const dbDatasource = new DbDataSource()
