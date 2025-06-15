// context/env-context.ts
import { z } from 'zod'
import { logger } from '@/context'

const EnvSchema = z.object({
  SERVICE_NAME: z.string(),
  NODE_ENV: z.enum(['dev', 'testing', 'staging', 'prod']),
  PORT: z.string().transform(Number),
  API_VER: z.string(),
  CORS_ORIGINS: z.string().optional(),

  // NATS-specific
  EVENT_BROKER_NAME: z.enum([
    'nats',
    'kafka',
    'redis',
    'sns',
    'sqs',
    'pubsub',
    'mock',
  ]),
  NATS_CLIENT_ID: z.string(),
  NATS_SERVERS: z.string().optional(), // comma-separated list like "nats://localhost:4222,nats://localhost:4223"
  NATS_PORT: z.string().transform(Number).optional(),
  NATS_MAX_RECONNECTS: z.string().transform(Number).optional(),
  NATS_BROKER_USER: z.string().optional(),
  NATS_BROKER_PASS: z.string().optional(),
  NATS_CONSOLE_DEBUG: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  logger.error('Invalid environment variables:', parsed.error.format())
  process.exit(1)
}

export const env = {
  ...parsed.data,
  // Process NATS_SERVERS into string[]
  NATS_SERVER_LIST: parsed.data.NATS_SERVERS?.split(',').map((s) =>
    s.trim()
  ) || ['nats://localhost:4222'],
}
