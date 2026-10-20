import { z } from 'zod'

/**
 * Validates environment variables once at startup so misconfiguration fails fast
 * with a readable message instead of a cryptic runtime error later.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z
    .string({ error: 'MONGO_URI is required – copy server/.env.example to server/.env and fill it in' })
    .regex(/^mongodb(\+srv)?:\/\//, 'MONGO_URI must start with mongodb:// or mongodb+srv://'),
  JWT_SECRET: z.string().default('airlab-secret-key-fallback-2026'),
  /** Comma-separated list of origins allowed to call the API (only needed when frontend is on another origin). */
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  ADMIN_NOTIFICATION_EMAIL: z.string().default('hf.alihasan0@gmail.com'),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('\n❌ Invalid server environment configuration:')
  for (const issue of parsed.error.issues) {
    console.error(`   • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
  }
  console.error('')
  process.exit(1)
}

export const env = parsed.data
export const isProd = env.NODE_ENV === 'production'
