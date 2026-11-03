import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { AdminModel } from '../models/Admin.js'
import { env, isProd } from '../config/env.js'
import { requireAdmin, type AuthRequest } from '../middleware/auth.js'
import { HttpError } from '../middleware/errors.js'

export const authRouter = Router()

// Simple in-memory rate limiter to prevent brute-force attacks on /login
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
  email: z.string().email(),
  password: z.string().min(1),
})

authRouter.post('/login', async (req, res, next) => {
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
    const admin = await AdminModel.findOne({ email: normalizedEmail }).select('+passwordHash')

    if (!admin) {
      recordFailedAttempt(clientIp)
      throw new HttpError(401, 'Invalid email or password')
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash)
    if (!isValid) {
      recordFailedAttempt(clientIp)
      throw new HttpError(401, 'Invalid email or password')
    }

    // Reset failed attempts on successful login
    resetRateLimit(clientIp)

    admin.lastLoginAt = new Date()
    await admin.save()

    const token = jwt.sign(
      { id: String(admin._id), email: admin.email, name: admin.name },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
  res.clearCookie('token')
  res.json({ success: true, message: 'Logged out successfully' })
})

authRouter.get('/me', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    if (!req.admin?.id) {
      throw new HttpError(401, 'Unauthorized')
    }

    const admin = await AdminModel.findById(req.admin.id)
    if (!admin) {
      throw new HttpError(401, 'Admin session invalid')
    }

    res.json({
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
