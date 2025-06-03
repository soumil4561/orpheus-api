/**
 * Defines the base datasource class which provides a common interface/abstract methods
 * for all datasource implementations.
 */
import { DatasourceContext } from '@/types'

export abstract class BaseDatasource<TContext extends DatasourceContext> {
  private _context: TContext

  constructor(context: TContext) {
    this._context = context
  }

  /**
   * Returns the context associated with this datasource.
   */
  public get context(): TContext {
    return this._context
  }

  /**
   * Sets the context for this datasource.
   * @param context The new context to set.
   */
  public set context(context: TContext) {
    this._context = context
  }

  /**
   * Abstract method to run a function with a retry mechanism.
   * With each retry, the funtion will be called again until it succeeds or the maximum number of retries is reached.
   * With each retry, the time between retries will be increased exponentially.
   * @param fn The function to run with retry.
   * @param retries The maximum number of retries to attempt before giving up.
   * @param delay The initial delay in milliseconds before the first retry.
   * @param maxDelay The maximum delay in milliseconds between retries.
   * @returns A promise that resolves when the function succeeds or rejects if all retries fail.
   * @throws Error if the function fails after all retries.
   */
  public abstract runWithRetry<T>(
    operation: () => Promise<T>,
    retries?: number,
    delay?: number,
    maxDelay?: number
  ): Promise<T>

  /**
   * Method to run a function with a timeout.
   * If the function does not complete within the specified timeout, it will throw an error.
   * This method is useful for ensuring that long-running operations do not block indefinitely.
   * @param operation The function to run with a timeout.
   * @param timeout The maximum time in milliseconds to wait for the function to complete.
   * @returns A promise that resolves when the function completes successfully.
   * @throws Error if the function does not complete within the specified timeout.
   * @throws Error if the function fails.
   */
  public abstract runWithTimeout<T>(
    operation: () => Promise<T>,
    timeout: number
  ): Promise<T>
}
