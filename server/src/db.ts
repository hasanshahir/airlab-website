import mongoose from 'mongoose'
import { env } from './config/env.js'

mongoose.set('strictQuery', true)

/** Opens the MongoDB connection. Works identically for Atlas and a self-hosted mongod. */
export async function connectDB(): Promise<typeof mongoose> {
  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'))
  mongoose.connection.on('reconnected', () => console.log('🔁 MongoDB reconnected'))

  const conn = await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10_000,
  })
  const { host, name } = conn.connection
  console.log(`🍃 MongoDB connected → ${host}/${name}`)
  return conn
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
}
