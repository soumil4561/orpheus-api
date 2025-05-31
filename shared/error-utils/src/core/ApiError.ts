export class ApiError extends Error {
  public statusCode: number
  public isOperational: boolean
  public details?: unknown

  constructor(
    statusCode: number,
    message: string,
    options?: {
      isOperational?: boolean
      details?: unknown
    }
  ) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = options?.isOperational ?? true
    this.details = options?.details

    Error.captureStackTrace(this)
  }
}
