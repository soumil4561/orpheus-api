import { identityDatasource } from '@/datasource'
import { User } from '@/entities'
import { PendingUserRegistration } from '@orpheus/db-entities'

export class UserRepository {
  private getQueryBuilder(alias = 'user') {
    return identityDatasource.queryWithAlias(User, alias)
  }

  async getAllUsers(): Promise<User[]> {
    // return await identityDatasource.query().select().from(User).getMany();
    return await this.getQueryBuilder().select().getMany()
  }

  async createUser(user: Partial<User>): Promise<User> {
    return await identityDatasource
      .query()
      .insert()
      .into(User)
      .values(user)
      .execute()
  }

  async createUserFromEvent(data): Promise<User> {
    //get the user from the pending user registration
    const pendingUser = await identityDatasource.query().select().from(PendingUserRegistration).where('id', data.id).getOne()
    if (!pendingUser) {
      throw new Error(`Pending user registration not found for ID: ${data.id}`)
    }
    //create a new user from the pending user registration
    const newUser = {
      id: pendingUser.id,
      email: pendingUser.email,
      username: pendingUser.username,
      password: pendingUser.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.createUser(newUser)

    //delete the pending user registration
  },
}
