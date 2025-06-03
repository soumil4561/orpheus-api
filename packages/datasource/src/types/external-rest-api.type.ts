import { DatasourceContext } from './index.js'

export interface ExternalRestApiDatasourceContext extends DatasourceContext {
  baseUrl: string
  token?: string
  headers?: Record<string, string>
  serviceName?: string
}
