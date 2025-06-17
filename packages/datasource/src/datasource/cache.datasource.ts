import { BaseDatasource } from './base'
import { CacheDatasourceContext } from '@/types'

/**
 * Abstract base class for cache-based data sources like Redis or in-memory stores.
 * Provides a consistent interface for connecting, retrieving, storing, and deleting cached data.
 *
 * Extend this class to implement concrete cache providers.
 *
 * @template TContext The type of context used to configure the datasource (defaults to `CacheDatasourceContext`).
 */
export abstract class CacheDatasource extends BaseDatasource<CacheDatasourceContext> {
  /**
   * Connects to the underlying cache store.
   * Should be called during application bootstrap or initialization.
   */
  abstract connect(): Promise<void>

  /**
   * Disconnects from the cache store.
   * Useful during graceful shutdowns.
   */
  abstract disconnect(): Promise<void>

  /**
   * Pings the cache store to verify connectivity.
   * @returns {Promise<boolean>} `true` if the store is reachable, otherwise `false`.
   */
  abstract ping(): Promise<boolean>

  /**
   * Retrieves a cached value by key.
   * @template T The expected return type of the cached value.
   * @param {string} key - The key to retrieve from cache.
   * @returns {Promise<T | null>} The cached value if found, or `null` if not found.
   */
  abstract get<T = unknown>(key: string): Promise<T | null>

  /**
   * Caches a value under a specific key.
   * @template T The type of the value to store.
   * @param {string} key - The key under which to store the value.
   * @param {T} value - The value to cache.
   * @param {number} [ttlInSeconds] - Optional TTL (time-to-live) in seconds. Overrides default if provided.
   */
  abstract set<T = unknown>(
    key: string,
    value: T,
    ttlInSeconds?: number
  ): Promise<void>

  /**
   * Deletes a cached value by key.
   * @param {string} key - The key to remove from cache.
   */
  abstract delete(key: string): Promise<void>
}
