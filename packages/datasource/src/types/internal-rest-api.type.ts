import { DatasourceContext } from './index.js'

export interface InternalRestApiDatasourceContext extends DatasourceContext {
  baseUrl: string
  token?: string
  headers?: Record<string, string>
  serviceName?: string
}
