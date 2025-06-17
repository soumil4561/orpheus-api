// context/env-context.ts
import { z } from 'zod'
import { logger } from '@/context'

const EnvSchema = z.object({
  SERVICE_NAME: z.string(),
  NODE_ENV: z.enum(['dev', 'test', 'prod']),
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
  NATS_SERVERS: z.string().optional(),
  NATS_PORT: z.string().transform(Number).optional(),
  NATS_MAX_RECONNECTS: z.string().transform(Number).optional(),
  NATS_BROKER_USER: z.string().optional(),
  NATS_BROKER_PASS: z.string().optional(),
  NATS_CONSOLE_DEBUG: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),

  // Redis/Cache
  CACHE_NAME: z.string().default('auth-cache'),
  TTL_DEFAULT_SECONDS: z.string().transform(Number).optional().default('3600'),
  NAMESPACE: z.string().default('auth-service'),

  REDIS_URL: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().transform(Number).optional().default('6379'),
  REDIS_USERNAME: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  REDIS_RETRY_ATTEMPTS: z.string().transform(Number).optional().default('3'),
  REDIS_RETRY_DELAY: z.string().transform(Number).optional().default('100'),
  REDIS_RETRY_MAX_DELAY: z
    .string()
    .transform(Number)
    .optional()
    .default('2000'),

  REDIS_CONNECTION_TIMEOUT: z
    .string()
    .transform(Number)
    .optional()
    .default('5000'),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  logger.error('Invalid environment variables:', parsed.error.format())
  process.exit(1)
}

export const env = {
  ...parsed.data,
  NATS_SERVER_LIST: parsed.data.NATS_SERVERS?.split(',').map((s) =>
    s.trim()
  ) || ['nats://localhost:4222'],
}
