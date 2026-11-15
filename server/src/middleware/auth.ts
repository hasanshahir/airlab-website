import crypto from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { AdminModel } from '../models/Admin.js'
import { HttpError } from './errors.js'

export const JWT_ISSUER = 'airlab-neduet-admin'
export const JWT_AUDIENCE = 'airlab-admin-portal'

export function computePasswordFingerprint(passwordHash: string): string {
  return crypto.createHash('sha256').update(passwordHash).digest('hex').slice(0, 16)
}

export interface AuthRequest extends Request {
  admin?: {
    id: string
    email: string
    name?: string
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')

  const bearer = req.headers.authorization
  const headerToken = bearer && /^Bearer\s+/i.test(bearer) ? bearer.replace(/^Bearer\s+/i, '').trim() : undefined
  const token = headerToken || req.cookies?.token

  if (!token || typeof token !== 'string') {
    return next(new HttpError(401, 'Unauthorized: please log in to access the admin panel'))
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as { id: string; email: string; name?: string; pwdFingerprint?: string }

    if (!payload?.id || !payload?.email || !mongoose.Types.ObjectId.isValid(payload.id)) {
      return next(new HttpError(401, 'Invalid admin session token'))
    }

    if (mongoose.connection.readyState !== 1) {
      return next(new HttpError(503, 'Database unavailable: cannot verify admin credentials'))
    }

    const admin = await AdminModel.findById(payload.id).select('+passwordHash').lean()
    if (!admin || !admin.passwordHash || String(admin.email).toLowerCase() !== String(payload.email).toLowerCase()) {
      return next(new HttpError(401, 'Admin account no longer valid. Please log in again.'))
    }

    const expectedFingerprint = computePasswordFingerprint(admin.passwordHash)
    if (!payload.pwdFingerprint || payload.pwdFingerprint !== expectedFingerprint) {
      return next(new HttpError(401, 'Session expired due to security update. Please log in again.'))
    }

    req.admin = {
      id: String(admin._id),
      email: admin.email,
      name: admin.name,
    }
    next()
  } catch {
    next(new HttpError(401, 'Invalid or expired session. Please log in again.'))
  }
}
