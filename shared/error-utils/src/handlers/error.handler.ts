//exports a middleware function that handles errors in an Express application

import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { ApiError } from '../core/ApiError'
import { status } from 'http-status'

/**
 * Global error handler for Express applications.
 * This middleware catches errors thrown in the application and formats them into a consistent JSON response.
 *
 * @param {Error | ApiError} err - The error object, which can be an instance of ApiError or a generic Error.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
export const globalApiErrorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // console.error(err.stack) // Log the error stack trace for debugging
  // Prevent sending response if headers are already sent
  if (res.headersSent) {
    return next(err)
  }

  // If the error is an instance of ApiError, use its properties
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err : null, // Send detailed error in development mode
    })
    return
  }

  // Set the response status code and send a JSON response with the error message
  res.status(status.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}, // Send detailed error in development mode
  })
  return
}
