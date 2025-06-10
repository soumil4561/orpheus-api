import { PostgresDatasource } from '@orpheus/datasource-provider'
import { identityContext, postgresTypeORMOptions } from '@/context'

export class IdentityDatasource extends PostgresDatasource {
  constructor() {
    super(identityContext, postgresTypeORMOptions)
  }
}
