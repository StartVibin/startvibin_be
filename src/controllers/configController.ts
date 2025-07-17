import { Request, Response, NextFunction } from 'express'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import { config } from '@/config/environment'
import logger from '@/utils/logger'

// Get X Post ID
export const getXPostId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.info('X Post ID requested')

    res.status(200).json({
      success: true,
      data: {
        xPostId: config.X_POST_ID
      }
    })
  }
)

// Get all public config values
export const getPublicConfig = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Public config requested')

    res.status(200).json({
      success: true,
      data: {
        xPostId: config.X_POST_ID,
        nodeEnv: config.NODE_ENV,
        frontendUrl: config.FRONTEND_URL
      }
    })
  }
) 