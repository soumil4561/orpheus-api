import { dbDatasource } from './db.datasource'
import {EventDatasource} from './event.datasource'

export const identityDatasource = new dbDatasource()
export const eventDatasource = new EventDatasource()

