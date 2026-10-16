import { env } from './config/env.js'
import { connectDB, disconnectDB } from './db.js'
import { createApp } from './app.js'

async function main() {
  await connectDB()

  const app = createApp()
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 AIR Lab API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`)
  })

  const shutdown = (signal: string) => {
    console.log(`\n${signal} received – shutting down…`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err instanceof Error ? err.message : err)
  process.exit(1)
})
