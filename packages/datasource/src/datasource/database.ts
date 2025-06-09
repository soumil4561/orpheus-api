import { RelationalDatasourceContext } from '@/types'

export abstract class RelationalDatabaseDatasource<
  TContext extends RelationalDatasourceContext,
> {
  private _context: TContext

  constructor(context: TContext) {
    this._context = context
  }

  //1. Ping the database to check if it is reachable.
  public abstract ping(): Promise<boolean>

  //2. Connect to the database using the provided context and return a connection object.
  public abstract connect(): Promise<unknown>

  //3. Execute a query against the database and return the results.
  public abstract queryRaw<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<T[]>

  //4. Close the database connection.
  public abstract close(): Promise<void>
}
