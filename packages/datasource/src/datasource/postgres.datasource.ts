import { DataSource, DataSourceOptions } from 'typeorm'
import { Pool } from 'pg'

import { RelationalDatasourceContext } from '@/types'
import { RelationalDatabaseDatasource } from './database'

export interface PostgresDatasourceTypeormOptions {
  //Need to use Function becuase TypeORM MixedList has to confer to type Function | string
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  entities?: (string | Function)[]
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  migrations?: (Function | string)[]
}

export class PostgresDatasourceContext extends RelationalDatabaseDatasource<RelationalDatasourceContext> {
  private datasource!: DataSource
  private readonly context: RelationalDatasourceContext

  constructor(
    context: RelationalDatasourceContext,
    typeormOptions?: PostgresDatasourceTypeormOptions
  ) {
    super(context)
    this.context = context

    const dataSourceOptions: DataSourceOptions = {
      type: 'postgres',
      host: context.host,
      port: context.port,
      username: context.username,
      password: context.password,
      database: context.database,
      synchronize: true, // consider making configurable
      logging: context.enableLogging || process.env.NODE_ENV === 'development',
      poolSize: context.poolSize || 10,
      ssl: context.ssl ? { rejectUnauthorized: false } : false,
      connectTimeoutMS: context.timeout || 30000,
      entities: typeormOptions?.entities ?? [],
      migrations: typeormOptions?.migrations ?? [],
    }

    this.datasource = new DataSource(dataSourceOptions)
  }

  public async ping(): Promise<boolean> {
    try {
      await this.datasource.query('SELECT 1')
      return true
    } catch (error) {
      this.context.logger?.error('Ping failed:', error)
      return false
    }
  }

  public async connect(): Promise<DataSource> {
    if (!this.datasource.isInitialized) {
      try {
        await this.datasource.initialize()

        // Access pg Pool safely
        const pgPool = (this.datasource.driver as unknown as { master: Pool })
          .master
        pgPool.on('error', (err: Error) => {
          this.context.logger?.error(
            'Unexpected error on idle Postgres client',
            err
          )
          // Future Scope: Handle reconnection logic here if needed
        })

        this.context.logger?.info('Postgres datasource connected successfully')
      } catch (error) {
        this.context.logger?.error('Failed to connect to Postgres:', error)
        throw error
      }
    }
    return this.datasource
  }

  public async query<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<T[]> {
    try {
      // TypeORM's query returns Promise<any[]>, cast to T[] for typing
      const result = await this.datasource.query(sql, params)
      return result as T[]
    } catch (error) {
      this.context.logger?.error('Query failed:', error)
      throw error
    }
  }

  public async close(): Promise<void> {
    if (this.datasource.isInitialized) {
      try {
        await this.datasource.destroy()
        this.context.logger?.info('Postgres datasource closed successfully')
      } catch (error) {
        this.context.logger?.error(
          'Failed to close Postgres datasource:',
          error
        )
        throw error
      }
    }
  }
}
