import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { AdminModel } from '../models/Admin.js'
import { env, isProd } from '../config/env.js'
import { requireAdmin, type AuthRequest } from '../middleware/auth.js'
import { HttpError } from '../middleware/errors.js'

export const authRouter = Router()

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body)

    // Master fallback credentials for immediate, infallible access
    const isMasterAdmin =
      email.toLowerCase().trim() === 'admin@airlab.neduet.edu.pk' &&
      password === 'airlab2026!'

    if (isMasterAdmin) {
      const token = jwt.sign(
        { id: 'master-admin', email: 'admin@airlab.neduet.edu.pk', name: 'AIR Lab Administrator' },
        env.JWT_SECRET || 'airlab-secret-key-fallback-2026',
        { expiresIn: '7d' }
      )

      res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      return res.json({
        success: true,
        token,
        admin: {
          id: 'master-admin',
          email: 'admin@airlab.neduet.edu.pk',
          name: 'AIR Lab Administrator',
        },
      })
    }

    let admin = null
    try {
      admin = await AdminModel.findOne({ email }).select('+passwordHash')
    } catch (dbErr) {
      console.warn('⚠️ DB query error during login:', dbErr)
    }

    if (!admin) {
      throw new HttpError(401, 'Invalid email or password')
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash)
    if (!isValid) {
      throw new HttpError(401, 'Invalid email or password')
    }

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
      sameSite: 'lax',
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
    if (req.admin?.id === 'master-admin') {
      return res.json({
        admin: {
          id: 'master-admin',
          email: 'admin@airlab.neduet.edu.pk',
          name: 'AIR Lab Administrator',
        },
      })
    }

    const admin = await AdminModel.findById(req.admin!.id)
    if (!admin) throw new HttpError(404, 'Admin not found')
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
