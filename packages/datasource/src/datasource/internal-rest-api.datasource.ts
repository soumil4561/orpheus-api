import { BaseDatasource } from '@/datasource'
import { InternalRestApiDatasourceContext } from '@/types'

export class InternalRestApiDatasource extends BaseDatasource<InternalRestApiDatasourceContext> {
  constructor(context: InternalRestApiDatasourceContext) {
    super(context)
  }

  public async runWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.context.retryPolicy?.retries || 3,
    delay: number = this.context.retryPolicy?.delay || 1000,
    maxDelay: number = this.context.retryPolicy?.maxDelay || 30000
  ): Promise<T> {
    let lastError: Error | null = null

    for (let i = 0; i < retries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        const currentDelay = Math.min(delay * 2 ** i, maxDelay)
        await new Promise((resolve) => setTimeout(resolve, currentDelay))
      }
    }
    this.context.logger?.error(
      `${this.context.name} - Operation failed after ${retries} retries: ${lastError?.message}`,
      lastError
    )
    throw new Error(
      `Operation failed after ${retries} retries: ${lastError?.message}`
    )
  }

  public async runWithTimeout<T>(
    operation: () => Promise<T>,
    timeout: number = this.context.timeout || 5000
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      return await operation()
    } catch (error) {
      throw new Error(
        `Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      clearTimeout(timeoutId)
    }
  }
}
