import app from './app'
import { config } from '@/config/environment'
import { connectDB } from '@/config/database'
import logger from '@/utils/logger'

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  logger.error(err.name, err.message, err.stack)
  process.exit(1)
})

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB()
    
    const server = app.listen(config.PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on ${config.HOST}:${config.PORT}`)
      logger.info(`📍 Environment: ${config.NODE_ENV}`)
      logger.info(`🔒 CORS origins: ${config.ALLOWED_ORIGINS.join(', ')}`)
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...')
      logger.error(err.name, err.message)
      server.close(() => {
        process.exit(1)
      })
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully')
      server.close(() => {
        logger.info('💥 Process terminated!')
      })
    })

  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()