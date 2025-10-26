import { status } from 'http-status'
import { RequestHandler } from 'express'
import { hashPassword } from '@orpheus/auth-utils'
import { apiHandler } from '@orpheus/api-handler'
import { eventDatasource, dbDatasource } from '@/datasource'
import constants from '@/constants'
import { env, logger } from '@/context'

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

  const user = await dbDatasource.createPendingUserRegistration(pendingUser)

  logger.info(`User registered with ID: ${JSON.stringify(user)}`)

  // publish event
  await eventDatasource.publish(env.SEND_EMAIL_EVENT_TOPIC, {
    data: user.raw[0],
    metadata: {
      eventType: env.SEND_EMAIL_EVENT_TOPIC,
      timestamp: new Date().toISOString(),
      source: 'auth-service',
    },
  } )

  return {
    data: null,
    statusCode: status.OK,
    message: constants.REGISTER_USER_SUCCESS_MSG,
  }
})

/**
 * Verifies the email of a user
 */
export const verifyEmail: RequestHandler = apiHandler(async (req) => {
  //check if to extract query params or body
  const { email, token } = req.method === 'GET' ? req.query : req.body

  // check if the user exists
  const pendingUser = await dbDatasource.getPendingUserByEmail(email)
  if (!pendingUser) {
    return {
      data: null,
      statusCode: status.NOT_FOUND,
      message: constants.USER_NOT_FOUND_MSG,
    }
  }

  // check if the token is valid
  if (pendingUser.emailVerifyToken !== token || Date.now() > pendingUser.emailTokenExpiresAt) {
    return {
      data: null,
      statusCode: status.UNAUTHORIZED,
      message: constants.INVALID_EMAIL_VERIFY_TOKEN_MSG,
    }
  }

  // update user to verified
  await dbDatasource.verifyPendingUserEmail(pendingUser.id)

  // publish event
  await eventDatasource.publish('user.email.verified', {
    id: pendingUser.id,
    email: pendingUser.email,
  })

  return {
    data: null,
    statusCode: status.OK,
    message: constants.EMAIL_VERIFICATION_SUCCESS_MSG,
  }
})
