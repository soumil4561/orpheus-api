import { logger, setContext } from '@orpheus/logger'

setContext(process.env.SERVICE_NAME ?? 'authn-service')

export { logger }
