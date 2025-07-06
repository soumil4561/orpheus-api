import { PostgresDatasource } from '@orpheus/datasource-provider'
import { dbContext, postgresTypeORMOptions } from '@/context'

export class dbDatasource extends PostgresDatasource {
  constructor() {
    super(dbContext, postgresTypeORMOptions)
  }
}
