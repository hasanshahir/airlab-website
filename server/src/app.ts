import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { env, isProd } from './config/env.js'
import { contentRouter } from './routes/content.js'
import { positionsRouter } from './routes/positions.js'
import { authRouter } from './routes/auth.js'
import { applicationsRouter } from './routes/applications.js'
import { adminCrudRouter } from './routes/admin.js'
import { errorHandler, notFound } from './middleware/errors.js'

export function createApp() {
  const app = express()

  // Behind Nginx/Apache in production – needed for correct client IPs (rate limiting) and secure cookies.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(helmet())
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true, // admin auth will use httpOnly cookies
    }),
  )
  app.use(express.json({ limit: '10mb' }))
  app.use(cookieParser())
  app.use(morgan(isProd ? 'combined' : 'dev'))

  app.get('/api/health', (_req, res) => {
    const dbStates: Record<number, string> = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }
    res.json({
      status: 'ok',
      db: dbStates[mongoose.connection.readyState] ?? 'uninitialized',
      uptime: Math.round(process.uptime()),
    })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/content', contentRouter)
  app.use('/api/positions', positionsRouter)
  app.use('/api/applications', applicationsRouter)
  app.use('/api/admin', adminCrudRouter)

  app.use('/api', notFound)
  app.use(errorHandler)

  return app
}
