import { createLogger, format, transports } from 'winston'

const { timestamp, combine, printf, errors, colorize } = format

// Custom format for your desired output: timestamp: log_level: context: message
const customFormat = printf(({ timestamp, level, context, message, stack }) => {
  const contextStr = context ? `${context}:` : 'general:'
  const logMessage = stack || message
  return `${timestamp}: ${level}: ${contextStr} ${logMessage}`
})

const logFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }), // capture error stack if error object passed
  customFormat
)

// Console format with colors
const consoleFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  colorize(),
  customFormat
)

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'auth-service' },
  transports: [
    new transports.Console({
      format: consoleFormat,
    }),
  ],
})

export function setContext(context: string) {
  logger.defaultMeta = {
    ...logger.defaultMeta,
    context,
  }
}
