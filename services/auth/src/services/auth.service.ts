import { Request, Response } from 'express'
import { hashPassword } from '@orpheus/auth-utils'
import { eventDatasource } from '@/datasource'

/**
 * Registers a user
 */
export async function registerUser(req: Request, res: Response) {
  //1. check using bloom filter, if email/username found reject
  // 2. hash the password
  req.body.password = await hashPassword(req.body.password, 12)
  //3. colate all the information, trigger email service for email verification
  await eventDatasource.publish('user.create.pending', req.body)
  res.send(req.body)
  //4. store the initial data all in redis with ttl ~60 mins
  //5. once user verifies email, we can setup the there db entries in the background and everything
  //6.
}
