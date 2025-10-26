// context/identity-env-context.ts
import { z } from 'zod'
import { logger } from '@/context'

const IdentityEnvSchema = z.object({
  // Required
  SERVICE_NAME: z.string().default('identity-service'),
  PORT: z.string().transform(Number).default('4000'),
  API_VER: z.string().default('v1'),
  CORS_ORIGINS: z.string().optional(),
  DATASOURCE_NAME: z
    .string()
    .optional()
    .default('identity-postgres-datasource'),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string().transform(Number),
  POSTGRES_USER: z.string(),
  POSTGRES_PASS: z.string(),
  POSTGRES_DB: z.string(),

  // Optional / tuning
  POSTGRES_NUM_RETRIES: z.string().transform(Number).optional().default('3'),
  POSTGRES_RETRY_DELAY: z.string().transform(Number).optional().default('1000'),
  POSTGRES_RETRY_MAX_DELAY: z
    .string()
    .transform(Number)
    .optional()
    .default('5000'),
  POSTGRES_REQUEST_TIMEOUT: z
    .string()
    .transform(Number)
    .optional()
    .default('30000'),
  POSTGRES_POOL_SIZE: z.string().transform(Number).optional().default('10'),

  // Custom Identity Constraints
  USERNAME_LENGTH_LIMIT: z.string().transform(Number).default('50'),
  EMAIL_LENGTH_LIMIT: z.string().transform(Number).default('50'),

  // Env
  NODE_ENV: z.enum(['dev', 'test', 'prod']).default('dev'),

  //NATS config
  NATS_SERVER_LIST: z.string().default('nats://localhost:4222'),
  NATS_CLIENT_ID: z.string().default('identity-service-client'),
  NATS_BROKER_USER: z.string().default('user'),
  NATS_BROKER_PASS: z.string().default('pass'),
  NATS_CONSOLE_DEBUG: z.string().transform((val) => val === 'true').default('false'),
  NATS_MAX_RECONNECTS: z.string().transform(Number).optional().default('10'),

  // topics 
  USER_REGISTRATION_LISTENER: z.string().default('user.create.pending'),
})

const parsed = IdentityEnvSchema.safeParse(process.env)

if (!parsed.success) {
  logger.error(
    'Invalid environment variables for identity service:',
    parsed.error.format()
  )
  process.exit(1)
}

export const env = parsed.data
