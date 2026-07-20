import dotenv from 'dotenv'
import app from './app.js'
import { prisma } from './config/db.js'
import { startAutoAttendanceJob } from './jobs/autoAttendance.js'

dotenv.config()

const PORT = process.env.PORT || 5000

let server

const startServer = async () => {
  try {
    await prisma.$connect()
    console.log('Database connected')

    startAutoAttendanceJob()

    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
      console.log(`Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

const shutdown = async (signal, exitCode) => {
  console.error(`${signal} received — shutting down gracefully`)
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
    await prisma.$disconnect()
  } finally {
    process.exit(exitCode)
  }
}

// A crashed process is in an undefined state — log it and let the process
// manager (PM2/systemd/Docker) restart it rather than limping on.
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  shutdown('uncaughtException', 1)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
  shutdown('unhandledRejection', 1)
})

process.on('SIGTERM', () => shutdown('SIGTERM', 0))
process.on('SIGINT', () => shutdown('SIGINT', 0))

startServer()
