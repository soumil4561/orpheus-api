import { DatasourceContext } from '@/types'

export interface ApiDatasourceContext extends DatasourceContext {
  baseUrl: string
  token?: string
  headers?: Record<string, string>
  serviceName?: string
}
