import { logger, setContext } from '@orpheus/logger'

setContext(process.env.SERVICE_NAME ?? 'identity-service')

export { logger }
