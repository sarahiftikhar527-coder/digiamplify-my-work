import http from 'http'
import app from './app.js'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import { initSocket } from './sockets/index.js'
import { startMeetingReminders } from './modules/meetings/meetings.reminders.job.js'

async function start() {
  await connectDB()
  const server = http.createServer(app)
  initSocket(server)

  server.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}/api/v1`)
    startMeetingReminders()
  })
}

process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err))

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})