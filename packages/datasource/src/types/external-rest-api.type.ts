import { DatasourceContext } from '.'

export interface ExternalRestApiDatasourceContext extends DatasourceContext {
  baseUrl: string
  token?: string
  headers?: Record<string, string>
  serviceName?: string
}
