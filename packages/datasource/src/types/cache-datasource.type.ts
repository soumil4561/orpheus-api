import { RedisClientOptions } from 'redis'
import { DatasourceContext } from './datasource.type'

/**
 * Supported cache providers that this context system can handle.
 */
export type SupportedCacheProviders = 'redis' | 'memcached' | 'mock'

/**
 * The base context for any cache provider.
 * @template TOptions - Specific connection options for the cache provider.
 */
export interface BaseCacheContext<TOptions = Record<string, unknown>>
  extends DatasourceContext {
  provider: SupportedCacheProviders
  ttlDefaultSeconds?: number
  namespace?: string
  options?: TOptions
}

/**
 * Redis-specific cache context.
 */
export interface RedisCacheContext
  extends BaseCacheContext<RedisClientOptions> {
  provider: 'redis'
  options?: RedisClientOptions
}

/**
 * Union of all supported cache contexts.
 */
export type CacheDatasourceContext = RedisCacheContext // | MemcachedCacheContext | MockCacheContext (add more later)
