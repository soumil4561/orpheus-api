import { Logger } from 'winston'

export interface DatasourceContext {
  name: string
  logger?: Logger
  requestId?: string
  retryPolicy?: {
    retries: number
    delay: number
    maxDelay?: number
  }
  timeout?: number
  //   metricsCollector?: MetricsClient;
  //   cache?: RedisClient;
  //   dbSession?: DbSession;
  environment?: 'dev' | 'prod' | 'test'
}
