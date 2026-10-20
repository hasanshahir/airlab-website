import { createApp } from '../server/src/app.js'
import { connectDB } from '../server/src/db.js'

let isConnected = false
const app = createApp()

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    try {
      await connectDB()
      isConnected = true
    } catch (dbErr: any) {
      console.error('⚠️ MongoDB connection warning in serverless handler:', dbErr?.message || dbErr)
      // Allow request to continue (e.g. master admin auth or health check)
    }
  }

  // In Vercel serverless functions, req.body is often pre-parsed as an object or string
  if (req.body && typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body)
    } catch {
      // Keep as-is if not valid JSON
    }
  }

  return app(req, res)
}
