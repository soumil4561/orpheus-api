import { RedisDatasource } from '@orpheus/datasource-provider'
import { cacheDatasourceContext } from '@/context'

export class CacheDatasource extends RedisDatasource {
  constructor() {
    super(cacheDatasourceContext)
  }
}
