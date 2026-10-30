import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { HttpError } from './errors.js'

export interface AuthRequest extends Request {
  admin?: {
    id: string
    email: string
  }
}

export function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return next(new HttpError(401, 'Unauthorized: please log in to access the admin panel'))
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string }
    req.admin = payload
    next()
  } catch (err) {
    next(new HttpError(401, 'Invalid or expired session. Please log in again.'))
  }
}
