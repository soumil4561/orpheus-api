import { createClient, RedisClientType } from 'redis'
import { CacheDatasource } from './cache.datasource'
import { CacheDatasourceContext, RedisCacheContext } from '@/types'

/**
 * A Redis-backed cache datasource implementation that connects to a Redis server
 * and performs basic cache operations (get/set/delete/ping).
 */
export class RedisDatasource extends CacheDatasource {
  private client!: RedisClientType

  constructor(context: CacheDatasourceContext) {
    super(context as RedisCacheContext)
    if (this.context.provider !== 'redis') {
      this.context.logger?.error(
        'Incorrect provider being used for redis datasource'
      )
    }
  }

  public async connect(): Promise<void> {
    this.client = createClient(this.context.options ?? {}) as RedisClientType

    this.client.on('error', (err: Error) =>
      this.context.logger?.error('[REDIS] Connection error:', err)
    )

    await this.client.connect()
    this.context.logger?.info('[REDIS] Connected successfully.')
  }

  public async disconnect(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.quit()
      this.context.logger?.info('[REDIS] Connection closed.')
    }
  }

  public async ping(): Promise<boolean> {
    try {
      const res = await this.client.ping()
      return res === 'PONG'
    } catch (err) {
      this.context.logger?.warn('[REDIS] Ping failed:', err)
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

    await this.client.set(namespacedKey, JSON.stringify(value), {
      EX: ttl,
    })

    this.context.logger?.debug(
      `[REDIS] Set key: ${namespacedKey} (TTL: ${ttl}s)`
    )
  }

  public async delete(key: string): Promise<void> {
    const namespacedKey = this.keyWithNamespace(key)
    await this.client.del(namespacedKey)
    this.context.logger?.debug(`[REDIS] Deleted key: ${namespacedKey}`)
  }
}
