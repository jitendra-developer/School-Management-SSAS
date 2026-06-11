import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import routes from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import './config/cloudinary.js'

dotenv.config()

const app = express()

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// API routes
app.use('/api', routes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler
app.use(errorHandler)

export default app
