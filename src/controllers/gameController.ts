import { Request, Response, NextFunction } from 'express'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import User from '@/models/User'
import logger from '@/utils/logger'

// Add game points and update high score
export const addGamePoints = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, gamePoints } = req.body

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    if (!gamePoints || gamePoints <= 0) {
      return next(new AppError('Game points must be greater than 0', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress)
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Add game points
    const previousGamePoints = user.gamePoints
    user.addGamePoints(gamePoints)
    
    // Check if this is a new high score
    const isNewHighScore = gamePoints > user.highScore
    if (isNewHighScore) {
      user.highScore = gamePoints
      logger.info(`New high score for user ${walletAddress}: ${gamePoints}`)
    }
    
    await user.save()

    logger.info(`Game points added for user ${walletAddress}: +${gamePoints} points`)

    res.status(200).json({
      success: true,
      message: 'Game points added successfully',
      data: {
        walletAddress: user.walletAddress,
        pointsAdded: gamePoints,
        previousGamePoints,
        currentGamePoints: user.gamePoints,
        totalPoints: user.totalPoints,
        highScore: user.highScore,
        isNewHighScore,
        previousHighScore: isNewHighScore ? user.highScore - gamePoints : user.highScore
      }
    })
  }
)

// Get user's game statistics
export const getGameStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress)
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        gamePoints: user.gamePoints,
        highScore: user.highScore,
        totalPoints: user.totalPoints,
        socialPoints: user.socialPoints,
        referralPoints: user.referralPoints
      }
    })
  }
)

// Get top players by high score
export const getTopPlayers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10
    const page = parseInt(req.query.page as string) || 1
    const skip = (page - 1) * limit

    // Get top players by high score
    const topPlayers = await User.find()
      .sort({ highScore: -1 })
      .skip(skip)
      .limit(limit)
      .select('walletAddress highScore gamePoints totalPoints')

    // Get total count for pagination
    const totalPlayers = await User.countDocuments()

    // Add rank to each player
    const playersWithRank = topPlayers.map((player, index) => ({
      ...player.toObject(),
      rank: skip + index + 1
    }))

    logger.info(`Top players requested: ${playersWithRank.length} players, page ${page}`)

    res.status(200).json({
      success: true,
      data: {
        players: playersWithRank,
        pagination: {
          page,
          limit,
          total: totalPlayers,
          totalPages: Math.ceil(totalPlayers / limit)
        }
      }
    })
  }
)

// Get user's rank by high score
export const getUserRank = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress)
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Count users with higher high score
    const rank = await User.countDocuments({ highScore: { $gt: user.highScore } })
    const userRank = rank + 1

    // Get total players count
    const totalPlayers = await User.countDocuments()

    logger.info(`User rank requested for ${walletAddress}: rank ${userRank}/${totalPlayers}`)

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        highScore: user.highScore,
        gamePoints: user.gamePoints,
        totalPoints: user.totalPoints,
        rank: userRank,
        totalPlayers
      }
    })
  }
)

// Reset user's game points (admin function)
export const resetGamePoints = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress)
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    const previousGamePoints = user.gamePoints
    const previousHighScore = user.highScore

    // Reset game points but keep high score
    user.gamePoints = 0
    await user.save()

    logger.info(`Game points reset for user ${walletAddress}: ${previousGamePoints} -> 0`)

    res.status(200).json({
      success: true,
      message: 'Game points reset successfully',
      data: {
        walletAddress: user.walletAddress,
        previousGamePoints,
        currentGamePoints: user.gamePoints,
        highScore: user.highScore,
        totalPoints: user.totalPoints
      }
    })
  }
) 