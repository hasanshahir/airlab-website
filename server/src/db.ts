import mongoose from 'mongoose'
import { env } from './config/env.js'

mongoose.set('strictQuery', true)

let connectionPromise: Promise<typeof mongoose> | null = null

/** Opens the MongoDB connection. Works identically for Atlas and a self-hosted mongod. */
export async function connectDB(): Promise<typeof mongoose> {
  if (!env.MONGO_URI || !/^mongodb(\+srv)?:\/\//.test(env.MONGO_URI)) {
    console.warn('⚠️  MONGO_URI not configured; running with local JSON seed fallback.')
    return mongoose
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose
  }

  if (!connectionPromise) {
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected')
      connectionPromise = null
    })
    mongoose.connection.on('reconnected', () => console.log('🔁 MongoDB reconnected'))

    connectionPromise = mongoose
      .connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 5_000,
        maxPoolSize: 10,
      })
      .then((conn) => {
        const { host, name } = conn.connection
        console.log(`🍃 MongoDB connected → ${host}/${name}`)
        return conn
      })
      .catch((err) => {
        connectionPromise = null
        throw err
      })
  }

  return connectionPromise
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
}
