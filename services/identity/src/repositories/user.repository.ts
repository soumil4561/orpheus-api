import { identityDatasource } from '@/datasource'
import { User } from '@/entities'

export class UserRepository {
  private getQueryBuilder(alias = 'user') {
    return identityDatasource.queryWithAlias(User, alias)
  }

  async getAllUsers(): Promise<User[]> {
    // return await identityDatasource.query().select().from(User).getMany();
    return await this.getQueryBuilder().select().getMany()
  }

  async create(user: Partial<User>): Promise<User> {
    return await identityDatasource
      .query()
      .insert()
      .into(User)
      .values(user)
      .execute()
  }
}
