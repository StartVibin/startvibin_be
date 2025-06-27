import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
//import compression from 'compression'

import { corsMiddleware } from '@/middleware/cors'
import { generalLimiter } from '@/middleware/rateLimiter'
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler'
import routes from '@/routes'
import logger from '@/utils/logger'
import { config } from '@/config/environment'

const app = express()

// Trust proxy (important for rate limiting and getting real IP)
app.set('trust proxy', 1)

// Security middleware
app.use(helmet()) // Set security headers
app.use(corsMiddleware) // Enable CORS
app.use(generalLimiter) // Apply rate limiting

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression middleware
//app.use(compression())

// Logging middleware
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  }))
}

// API routes
app.use('/api/v1', routes)

// Handle undefined routes
app.use(notFoundHandler)

// Global error handler
app.use(errorHandler)

export default app