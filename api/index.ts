import { createApp } from '../server/src/app.js'
import { connectDB } from '../server/src/db.js'

let isConnected = false
const app = createApp()

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    await connectDB()
    isConnected = true
  }
  return app(req, res)
}
