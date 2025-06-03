import { DatasourceContext } from '.'

export interface InternalRestApiDatasourceContext extends DatasourceContext {
  baseUrl: string
  token?: string
  headers?: Record<string, string>
  serviceName?: string
}
