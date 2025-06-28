import { PostgresDatasource } from '@orpheus/datasource-provider'
import { dbContext, postgresTypeORMOptions } from '@/context'
import { PendingUserRegistration } from '@orpheus/db-entities'

/**
 * `DbDataSource` is a custom PostgreSQL datasource for the Identity service.
 * It extends the generic `PostgresDatasource` and provides high-level
 * database interaction methods for entities like `PendingUserRegistration`.
 */
export class DbDataSource extends PostgresDatasource {
  /**
   * Initializes the datasource with the configured DB context and TypeORM options.
   */
  constructor() {
    super(dbContext, postgresTypeORMOptions)
  }

  /**
   * Creates a new pending user registration entry in the database.
   *
   * @param pendingUserRegistrationEntry - Partial entity object containing email,
   * username, hashed password, and other optional verification metadata.
   *
   * @returns A `Promise` resolving to the persisted `PendingUserRegistration` entity.
   *
   * @example
   * ```ts
   * const entry = await db.createPendingUserRegistration({
   *   id: uuidv4(),
   *   email: 'test@example.com',
   *   username: 'testuser',
   *   password: hashedPassword,
   *   emailVerifyToken: token,
   *   emailTokenExpiresAt: Date.now() + 15 * 60 * 1000,
   *   expiresAt: Date.now() + 15 * 60 * 1000,
   * })
   * ```
   */
  async createPendingUserRegistration(
    pendingUserRegistrationEntry: Partial<PendingUserRegistration>
  ): Promise<PendingUserRegistration> {
    return await this.query()
      .insert()
      .into(PendingUserRegistration)
      .values(pendingUserRegistrationEntry)
      .execute()
  }
}
