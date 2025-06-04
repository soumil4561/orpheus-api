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
}
