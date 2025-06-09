import { DatasourceContext } from './datasource.type'

/**
 * This interface is used to define a relational datasource.
 * It can be extended to include specific methods and properties
 * for different types of relational databases.
 */
export interface RelationalDatasourceContext extends DatasourceContext {
  connectionString?: string //Connect via connection string or individual parameters

  host?: string
  port?: number
  username?: string
  password?: string
  database?: string
  type: 'mysql' | 'postgresql' | 'sqlite' | 'mssql'

  // Optional configs
  poolSize?: number
  ssl?: boolean
  enableLogging?: boolean // Enable logging for queries and errors
}
