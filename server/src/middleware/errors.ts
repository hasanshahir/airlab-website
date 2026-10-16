import type { ErrorRequestHandler, RequestHandler } from 'express'
import mongoose from 'mongoose'
import { ZodError } from 'zod'
import { isProd } from '../config/env.js'

/** Throw this from route handlers to send a specific status + message. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
  }
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = 500
  let message = 'Internal server error'
  let details: unknown

  if (err instanceof HttpError) {
    status = err.status
    message = err.message
    details = err.details
  } else if (err instanceof ZodError) {
    status = 400
    message = 'Validation failed'
    details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400
    message = 'Validation failed'
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }))
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400
    message = `Invalid value for ${err.path}`
  } else if (typeof err === 'object' && err && 'code' in err && err.code === 11000) {
    status = 409
    message = 'Duplicate value'
    details = 'keyValue' in err ? err.keyValue : undefined
  }

  if (status >= 500) console.error(err)

  res.status(status).json({
    error: message,
    ...(details !== undefined && { details }),
    ...(!isProd && status >= 500 && err instanceof Error && { stack: err.stack }),
  })
}
