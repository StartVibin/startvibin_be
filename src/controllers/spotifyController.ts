import { Request, Response, NextFunction } from 'express'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import User from '@/models/User'
import logger from '@/utils/logger'

// Update user's Spotify data
export const updateSpotifyData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, spotifyId, spotifyEmail } = req.body

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    if (!spotifyId) {
      return next(new AppError('Spotify ID is required', 400))
    }

    if (!spotifyEmail) {
      return next(new AppError('Spotify email is required', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress.toLowerCase())
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user already connected Spotify to prevent double points
    const wasAlreadyConnected = user.spotifyConnected

    // Update user with Spotify data
    user.spotifyId = spotifyId
    user.spotifyEmail = spotifyEmail
    user.spotifyConnected = true

    // Award social points for Spotify connection (only if not already connected)
    let pointsAwarded = 0
    if (!wasAlreadyConnected) {
      pointsAwarded = 50 // Award 50 points for Spotify connection
      user.socialPoints += pointsAwarded
    }

    await user.save()

    if (pointsAwarded > 0) {
      logger.info(`User ${walletAddress} connected Spotify account: ${spotifyId}, awarded ${pointsAwarded} points`)
    } else {
      logger.info(`User ${walletAddress} updated Spotify account: ${spotifyId} (already connected)`)
    }

    res.status(200).json({
      success: true,
      message: wasAlreadyConnected ? 'Spotify data updated successfully' : 'Spotify connected successfully',
      data: {
        walletAddress: user.walletAddress,
        spotifyId: user.spotifyId,
        spotifyEmail: user.spotifyEmail,
        spotifyConnected: user.spotifyConnected,
        pointsAwarded,
        socialPoints: user.socialPoints,
        totalPoints: user.totalPoints
      }
    })
  }
)

// Get user's Spotify data
export const getSpotifyData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress.toLowerCase())
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user has Spotify data
    if (!user.spotifyConnected || !user.spotifyId) {
      return next(new AppError('User has not connected Spotify', 404))
    }

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        spotifyId: user.spotifyId,
        spotifyEmail: user.spotifyEmail,
        spotifyConnected: user.spotifyConnected,
        connectedAt: user.updatedAt
      }
    })
  }
) 