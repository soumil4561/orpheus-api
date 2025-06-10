import {
  RelationalDatasourceContext,
  PostgresDatasourceTypeormOptions,
} from '@orpheus/datasource-provider'

import { User } from '@/entities'

export const identityContext: RelationalDatasourceContext = {
  name:
    process.env.DATASOURCE_NAME ??
    (() => {
      throw new Error('DATASOURCE_NAME environment variable is not set')
    })(),

  retryPolicy: {
    retries: Number(process.env.POSTGRES_NUM_RETRIES),
    delay: Number(process.env.POSTGRES_RETRY_DELAY),
    maxDelay: Number(process.env.POSTGRES_RETRY_MAX_DELAY),
  },
  timeout: Number(process.env.POSTGRES_REQUEST_TIMEOUT),
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASS,
  database: process.env.POSTGRES_DB,
  type: 'postgresql',
  poolSize: Number(process.env.POSTGRES_POOL_SIZE),
  ssl: process.env.NODE_ENV === 'production',
  enableLogging: process.env.NODE_ENV === 'development',
}

export const postgresTypeORMOptions: PostgresDatasourceTypeormOptions = {
  entities: [User],
  migrations: [],
}
