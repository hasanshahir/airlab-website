import { createApp } from '../server/src/app.js'
import { connectDB } from '../server/src/db.js'

let isConnected = false
const app = createApp()

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
  return app(req, res)
}
