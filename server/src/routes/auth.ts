import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { AdminModel } from '../models/Admin.js'
import { env, isProd } from '../config/env.js'
import {
  requireAdmin,
  computePasswordFingerprint,
  JWT_ISSUER,
  JWT_AUDIENCE,
  type AuthRequest,
} from '../middleware/auth.js'
import { HttpError } from '../middleware/errors.js'

export const authRouter = Router()

// Precomputed bcrypt hash used when email is not found to prevent timing-based user enumeration
const DUMMY_BCRYPT_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

// In-memory IP rate limiter + DB-backed per-account lockout to prevent brute-force attacks
interface AttemptRecord {
  count: number
  firstAttempt: number
}
const loginAttempts = new Map<string, AttemptRecord>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(ip)
  if (!record) return true

  if (now - record.firstAttempt > LOCKOUT_MS) {
    loginAttempts.delete(ip)
    return true
  }

  return record.count < MAX_ATTEMPTS
}

function recordFailedAttempt(ip: string) {
  const now = Date.now()
  const record = loginAttempts.get(ip)
  if (!record || now - record.firstAttempt > LOCKOUT_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
  } else {
    record.count += 1
  }
}

function resetRateLimit(ip: string) {
  loginAttempts.delete(ip)
}

const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(256),
})

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .max(256),
})

authRouter.post('/login', async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown'

  if (!checkRateLimit(clientIp)) {
    return next(
      new HttpError(
        429,
        'Too many failed login attempts. This IP address has been temporarily locked out for 15 minutes.'
      )
    )
  }

  try {
    const { email, password } = LoginSchema.parse(req.body)
    const normalizedEmail = email.toLowerCase().trim()

    // Strictly authenticate against the database (bcrypt hash comparison)
    const admin = await AdminModel.findOne({ email: normalizedEmail }).select(
      '+passwordHash +failedLoginAttempts +lockUntil'
    )

    // Check DB-level account lockout (persists across serverless cold starts)
    if (admin?.lockUntil && new Date(admin.lockUntil).getTime() > Date.now()) {
      return next(
        new HttpError(
          429,
          'This admin account is temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.'
        )
      )
    }

    const hashToCompare = admin?.passwordHash || DUMMY_BCRYPT_HASH
    const isValid = await bcrypt.compare(password, hashToCompare)

    if (!admin || !isValid) {
      recordFailedAttempt(clientIp)
      if (admin) {
        const attempts = (admin.failedLoginAttempts || 0) + 1
        admin.failedLoginAttempts = attempts
        if (attempts >= MAX_ATTEMPTS) {
          admin.lockUntil = new Date(Date.now() + LOCKOUT_MS)
          admin.failedLoginAttempts = 0
        }
        await admin.save()
      }
      throw new HttpError(401, 'Invalid email or password')
    }

    // Reset failed attempts on successful login
    resetRateLimit(clientIp)
    admin.failedLoginAttempts = 0
    admin.lockUntil = null
    admin.lastLoginAt = new Date()
    await admin.save()

    const pwdFingerprint = computePasswordFingerprint(admin.passwordHash)
    const token = jwt.sign(
      {
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        pwdFingerprint,
      },
      env.JWT_SECRET,
      {
        algorithm: 'HS256',
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        expiresIn: '12h',
      }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000,
    })

    res.json({
      success: true,
      token,
      admin: {
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
      },
    })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
  })
  res.json({ success: true, message: 'Logged out successfully' })
})

authRouter.get('/me', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    if (!req.admin?.id) {
      throw new HttpError(401, 'Unauthorized')
    }

    res.json({
      admin: {
        id: req.admin.id,
        email: req.admin.email,
        name: req.admin.name,
      },
    })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/change-password', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    if (!req.admin?.id) {
      throw new HttpError(401, 'Unauthorized')
    }

    const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body)
    const admin = await AdminModel.findById(req.admin.id).select('+passwordHash')
    if (!admin) {
      throw new HttpError(401, 'Admin account not found')
    }

    const matches = await bcrypt.compare(currentPassword, admin.passwordHash)
    if (!matches) {
      throw new HttpError(400, 'Current password is incorrect')
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 12)
    admin.failedLoginAttempts = 0
    admin.lockUntil = null
    await admin.save()

    const pwdFingerprint = computePasswordFingerprint(admin.passwordHash)
    const newToken = jwt.sign(
      {
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        pwdFingerprint,
      },
      env.JWT_SECRET,
      {
        algorithm: 'HS256',
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        expiresIn: '12h',
      }
    )

    res.cookie('token', newToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000,
    })

    res.json({
      success: true,
      message: 'Password updated successfully. All other sessions have been invalidated.',
      token: newToken,
    })
  } catch (err) {
    next(err)
  }
})
