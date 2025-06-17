import Redis from 'ioredis'
import { CacheDatasource } from './cache.datasource'
import { CacheDatasourceContext, RedisCacheContext } from '@/types'

/**
 * A Redis-backed cache datasource implementation using ioredis.
 * Connects to a Redis server and performs basic cache operations (get, set, delete, ping).
 *
 * Recommended context setup variables for seamless integration:
 * ---
 * - `provider: 'redis'`
 * - `name: string` (used for connectionName)
 * - `host: string` (default: '127.0.0.1')
 * - `port: number` (default: 6379)
 * - `username?: string`
 * - `password?: string`
 * - `namespace?: string` (optional prefix for all keys)
 * - `ttlDefaultSeconds?: number` (default TTL for set)
 * - `timeout?: number` (default: 5000 ms)
 * - `retryPolicy?: { retries?: number, maxDelay?: number }`
 * - `logger?: { info(), warn(), error(), debug() }`
 */
export class RedisDatasource extends CacheDatasource {
  private client!: Redis

  constructor(context: CacheDatasourceContext) {
    super(context as RedisCacheContext)
    if (this.context.provider !== 'redis') {
      this.context.logger?.error?.(
        '[REDIS] Incorrect provider used for RedisDatasource'
      )
    }
  }

  public async connect(): Promise<void> {
    const {
      name,
      port = 6379,
      host = '127.0.0.1',
      username,
      password,
      timeout = 5000,
      retryPolicy,
    } = this.context

    this.client = new Redis({
      connectionName: name,
      port,
      host,
      username,
      password,
      connectTimeout: timeout,
      retryStrategy: retryPolicy?.retries
        ? (times: number) => {
            if (times > retryPolicy.retries!) return null
            return Math.min(retryPolicy.maxDelay ?? 2000, times * 100)
          }
        : undefined,
      maxRetriesPerRequest: retryPolicy?.maxDelay,
    })

    this.client.on('error', (err: Error) =>
      this.context.logger?.error?.('[REDIS] Connection error:', err)
    )

    this.client.on('connect', () =>
      this.context.logger?.info?.('[REDIS] Connected successfully.')
    )

    await new Promise<void>((resolve, reject) => {
      this.client.once('ready', resolve)
      this.client.once('error', reject)
    })
  }

  public async disconnect(): Promise<void> {
    if (
      this.client?.status === 'ready' ||
      this.client?.status === 'connecting'
    ) {
      await this.client.quit()
      this.context.logger?.info?.('[REDIS] Connection closed.')
    }
  }

  public async ping(): Promise<boolean> {
    try {
      const res = await this.client.ping()
      return res === 'PONG'
    } catch (err) {
      this.context.logger?.warn?.('[REDIS] Ping failed:', err)
      return false
    }
  }

  private keyWithNamespace(key: string): string {
    return this.context.namespace ? `${this.context.namespace}:${key}` : key
  }

  public async get<T = unknown>(key: string): Promise<T | null> {
    const namespacedKey = this.keyWithNamespace(key)
    const value = await this.client.get(namespacedKey)
    return value ? JSON.parse(value) : null
  }

  public async set<T = unknown>(
    key: string,
    value: T,
    ttlInSeconds?: number
  ): Promise<void> {
    const namespacedKey = this.keyWithNamespace(key)
    const ttl = ttlInSeconds ?? this.context.ttlDefaultSeconds ?? 3600

    await this.client.set(namespacedKey, JSON.stringify(value), 'EX', ttl)

    this.context.logger?.debug?.(
      `[REDIS] Set key: ${namespacedKey} (TTL: ${ttl}s)`
    )
  }

  public async delete(key: string): Promise<void> {
    const namespacedKey = this.keyWithNamespace(key)
    await this.client.del(namespacedKey)
    this.context.logger?.debug?.(`[REDIS] Deleted key: ${namespacedKey}`)
  }
}
