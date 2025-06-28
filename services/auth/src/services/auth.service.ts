import { status } from 'http-status'
import { RequestHandler } from 'express'
import { hashPassword } from '@orpheus/auth-utils'
import { apiHandler } from '@orpheus/api-handler'
import { eventDatasource, dbDatasource } from '@/datasource'
import constants from '@/constants'

/**
 * Registers a user
 */
export const registerUser: RequestHandler = apiHandler(async (req) => {
  // check username/password existence

  // hash password
  req.body.password = await hashPassword(
    req.body.password,
    constants.PASSWORD_HASH_SALT_ROUNDS
  )

  const pendingUser = {
    id: crypto.randomUUID(),
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    expiresAt: Date.now() + constants.PENDING_USER_EXPIRY,
    emailVerifyToken: crypto.randomUUID(),
    emailTokenExpiresAt: Date.now() + constants.EMAIL_VERIFY_TOKEN_EXPIRY,
    isEmailVerified: false,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || '',
  }

  // publish event
  await eventDatasource.publish('user.create.pending', req.body)

  await dbDatasource.createPendingUserRegistration(pendingUser)

  return {
    data: null,
    statusCode: status.OK,
    message: constants.REGISTER_USER_SUCCESS_MSG,
  }
})
