import { CacheDatasourceContext } from '@orpheus/datasource-provider'
import { env, logger } from '@/context'

export const cacheDatasourceContext: CacheDatasourceContext = {
  provider: 'redis',
  name: env.CACHE_NAME,
  logger: logger,
  retryPolicy: {
    retries: env.REDIS_RETRY_ATTEMPTS,
    delay: env.REDIS_RETRY_DELAY,
    maxDelay: env.REDIS_RETRY_MAX_DELAY,
  },
  timeout: env.REDIS_CONNECTION_TIMEOUT,
  ttlDefaultSeconds: env.TTL_DEFAULT_SECONDS,
  namespace: env.NAMESPACE,
  environment: env.NODE_ENV,
  host: env.REDIS_URL,
  port: env.REDIS_PORT,
  username: env.REDIS_USERNAME ?? '',
  password: env.REDIS_PASSWORD ?? '',
}
