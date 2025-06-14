// context/env-context.ts
import { z } from 'zod'
import { logger } from '@/context'

const EnvSchema = z.object({
  SERVICE_NAME: z.string(),
  NODE_ENV: z.enum(['dev', 'testing', 'staging', 'prod']),
  PORT: z.string().transform(Number),
  API_VER: z.string(),
  CORS_ORIGINS: z.string().optional(),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  logger.error('Invalid environment variables:', parsed.error.format())
  process.exit(1)
}

export const env = parsed.data
