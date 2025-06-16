import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ApiResponse } from '@/types'

export interface HandlerResult<T> {
  data: T | null
  message?: string
  statusCode: number
  success?: boolean
}

/**
 * Wraps an async route handler and automatically formats the response.
 * Handles successful responses with consistent `ApiResponse` shape,
 * and forwards thrown errors to the global error handler.
 *
 * This helps you:
 * - Eliminate repeated `res.status(...).json(...)` calls
 * - Return consistent success response format
 * - Let you throw `ApiError`s and catch them globally
 *
 * @template T The type of the data to return in the response.
 * @param fn The actual async handler function that returns `HandlerResult<T>`.
 * @returns An Express `RequestHandler` ready to be used as a controller.
 *
 * @example
 * ```ts
 * const getUser = apiHandler(async (req) => {
 *   const user = await findUser(req.params.id)
 *   if (!user) throw new ApiError(status.NOT_FOUND, "User not found")
 *   return { data: user, statusCode: status.OK }
 * })
 * ```
 */
export function apiHandler<T = unknown>(
  fn: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<HandlerResult<T>>
): RequestHandler {
  return async (req, res, next) => {
    try {
      const { data, message, statusCode, success } = await fn(req, res, next)

      // If response was already sent (e.g., early stream), skip
      if (res.headersSent) return

      const response: ApiResponse<T> = {
        success: success ?? true,
        data,
        message: message ?? null,
      }

      res.status(statusCode).json(response)
    } catch (err) {
      if (!res.headersSent) next(err) // Delegate to globalApiErrorHandler
    }
  }
}
