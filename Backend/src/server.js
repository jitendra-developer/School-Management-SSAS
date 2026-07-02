import dotenv from 'dotenv'
import app from './app.js'
import { prisma } from './config/db.js'
import { startAutoAttendanceJob } from './jobs/autoAttendance.js'

dotenv.config()

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await prisma.$connect()
    console.log('Database connected')

    startAutoAttendanceJob()

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
      console.log(`Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
