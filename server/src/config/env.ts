import crypto from 'node:crypto'
import { z } from 'zod'

const WEAK_PLACEHOLDER_SECRETS = new Set([
  '',
  'airlab-secret-key-fallback-2026',
  'super-secret-key-change-in-production',
])

const fallbackRuntimeEntropy = crypto.randomBytes(64).toString('hex')

function resolveSecureJwtSecret(rawSecret: string | undefined, mongoUri: string | undefined): string {
  const trimmed = (rawSecret ?? '').trim()
  if (trimmed.length >= 32 && !WEAK_PLACEHOLDER_SECRETS.has(trimmed)) {
    return trimmed
  }
  // Derive a high-entropy secret tied to the private database URI (or per-process entropy if no DB URI)
  // so no publicly committed fallback string can ever be used to forge admin JWTs.
  const secretSeed = mongoUri && mongoUri.trim().length > 0 ? mongoUri.trim() : fallbackRuntimeEntropy
  return crypto
    .createHmac('sha512', 'airlab-neduet-admin-jwt-signing-key-v2')
    .update(secretSeed)
    .digest('hex')
}

/**
 * Validates environment variables once at startup so misconfiguration fails fast
 * with a readable message instead of a cryptic runtime error later.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().optional().default(''),
  JWT_SECRET: z.string().optional().default(''),
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

export const env = {
  ...parsed.data,
  JWT_SECRET: resolveSecureJwtSecret(parsed.data.JWT_SECRET, parsed.data.MONGO_URI),
}
export const isProd = env.NODE_ENV === 'production'
