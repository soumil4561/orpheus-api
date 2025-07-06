import { logger } from '@orpheus/logger'

export interface BaseServerContext {
  serviceName: string
  port: number
  env: string
  logger: typeof logger
  enableMetrics?: boolean
  onReady?: () => void | Promise<void>
  onShutdown?: () => void | Promise<void>
  tags?: Record<string, string | number>
}
