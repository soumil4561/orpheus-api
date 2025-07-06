import {
  RelationalDatasourceContext,
  PostgresDatasourceTypeormOptions,
} from '@orpheus/datasource-provider'
import { env } from './env-context'
import { PendingUserRegistration } from '@orpheus/db-entities'

export const dbContext: RelationalDatasourceContext = {
  name: env.DATASOURCE_NAME,
  retryPolicy: {
    retries: env.POSTGRES_NUM_RETRIES,
    delay: env.POSTGRES_RETRY_DELAY,
    maxDelay: env.POSTGRES_RETRY_MAX_DELAY,
  },
  timeout: env.POSTGRES_REQUEST_TIMEOUT,
  host: process.env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASS,
  database: env.POSTGRES_DB,
  type: 'postgresql',
  poolSize: Number(env.POSTGRES_POOL_SIZE),
  ssl: env.NODE_ENV === 'prod',
  enableLogging: env.NODE_ENV === 'dev',
}

export const postgresTypeORMOptions: PostgresDatasourceTypeormOptions = {
  entities: [PendingUserRegistration],
  migrations: [],
}
