import { Request, Response, NextFunction } from 'express'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import User from '@/models/User'
import logger from '@/utils/logger'

// Verify X/Twitter connection
export const verifyXConnection = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, xId, xUsername, xDisplayName, xProfileImageUrl, xVerified } = req.body

    if (!walletAddress || !xId) {
      return next(new AppError('Wallet address and X ID are required', 400))
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user already connected X to prevent double points
    const wasAlreadyConnected = user.xConnected;
    
    // Update user with X data and mark as connected
    user.xId = xId
    user.xUsername = xUsername || ''
    user.xDisplayName = xDisplayName || ''
    user.xProfileImageUrl = xProfileImageUrl || ''
    user.xVerified = xVerified || false
    user.xConnected = true


    // Award social points for X connection (only if not already connected)
    let pointsAwarded = 0;
    if (!wasAlreadyConnected) {
      pointsAwarded = 100;
      user.socialPoints += pointsAwarded;
    }
    user.totalPoints = user.gamePoints + user.socialPoints + user.referralPoints

    await user.save()

    if (pointsAwarded > 0) {
      logger.info(`User ${walletAddress} connected X account: ${xId}, awarded ${pointsAwarded} points`);
    } else {
      logger.info(`User ${walletAddress} updated X account: ${xId} (already connected)`);
    }

    res.status(200).json({
      success: true,
      message: wasAlreadyConnected ? 'X connection updated successfully' : 'X connection verified successfully',
      data: {
        pointsAwarded,
        totalSocialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        xConnected: user.xConnected,
        xVerified: user.xVerified
      }
    })
  }
)

// Verify X/Twitter follow
export const verifyXFollow = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, targetUsername } = req.body

    if (!walletAddress || !targetUsername) {
      return next(new AppError('Wallet address and target username are required', 400))
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user has connected X
    if (!user.xConnected) {
      return next(new AppError('User must connect X account first', 400))
    }

    // Check if already followed
    if (user.xFollowed) {
      return next(new AppError('User has already completed this task', 400))
    }

    // Mark as followed and award points
    user.xFollowed = true
    const pointsAwarded = 200
    user.socialPoints += pointsAwarded
    user.totalPoints = user.gamePoints + user.socialPoints + user.referralPoints

    await user.save()

    logger.info(`User ${walletAddress} followed ${targetUsername}, awarded ${pointsAwarded} points`)

    res.status(200).json({
      success: true,
      message: 'X follow verified successfully',
      data: {
        pointsAwarded,
        totalSocialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        xFollowed: user.xFollowed
      }
    })
  }
)

// Verify X/Twitter reply
export const verifyXReply = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, tweetId } = req.body

    if (!walletAddress || !tweetId) {
      return next(new AppError('Wallet address and tweet ID are required', 400))
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user has connected X
    if (!user.xConnected) {
      return next(new AppError('User must connect X account first', 400))
    }

    // Check if already replied
    if (user.xReplied) {
      return next(new AppError('User has already completed this task', 400))
    }

    // Mark as replied and award points
    user.xReplied = true
    const pointsAwarded = 300
    user.socialPoints += pointsAwarded
    user.totalPoints = user.gamePoints + user.socialPoints + user.referralPoints

    await user.save()

    logger.info(`User ${walletAddress} replied to tweet ${tweetId}, awarded ${pointsAwarded} points`)

    res.status(200).json({
      success: true,
      message: 'X reply verified successfully',
      data: {
        pointsAwarded,
        totalSocialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        xReplied: user.xReplied
      }
    })
  }
)

// Verify X/Twitter repost
export const verifyXRepost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, tweetId } = req.body

    if (!walletAddress || !tweetId) {
      return next(new AppError('Wallet address and tweet ID are required', 400))
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user has connected X
    if (!user.xConnected) {
      return next(new AppError('User must connect X account first', 400))
    }

    // Check if already reposted
    if (user.xReposted) {
      return next(new AppError('User has already completed this task', 400))
    }

    // Mark as reposted and award points
    user.xReposted = true
    const pointsAwarded = 300
    user.socialPoints += pointsAwarded
    user.totalPoints = user.gamePoints + user.socialPoints + user.referralPoints

    await user.save()

    logger.info(`User ${walletAddress} reposted tweet ${tweetId}, awarded ${pointsAwarded} points`)

    res.status(200).json({
      success: true,
      message: 'X repost verified successfully',
      data: {
        pointsAwarded,
        totalSocialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        xReposted: user.xReposted
      }
    })
  }
)

// Verify X/Twitter post
export const verifyXPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.body

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user has connected X
    if (!user.xConnected) {
      return next(new AppError('User must connect X account first', 400))
    }

    // Check if already posted
    if (user.xPosted) {
      return next(new AppError('User has already completed this task', 400))
    }

    // Mark as posted and award points
    user.xPosted = true
    const pointsAwarded = 100
    user.socialPoints += pointsAwarded
    user.totalPoints = user.gamePoints + user.socialPoints + user.referralPoints

    await user.save()

    logger.info(`User ${walletAddress} posted about Vibin, awarded ${pointsAwarded} points`)

    res.status(200).json({
      success: true,
      message: 'X post verified successfully',
      data: {
        pointsAwarded,
        totalSocialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        xPosted: user.xPosted
      }
    })
  }
)

// Verify Telegram connection
export const verifyTelegramConnection = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, telegramId, telegramUsername, telegramFirstName, telegramLastName, telegramPhotoUrl } = req.body

    if (!walletAddress || !telegramId) {
      return next(new AppError('Wallet address and Telegram ID are required', 400))
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Update user with Telegram data and mark as connected
    user.telegramId = telegramId.toString()
    user.telegramUsername = telegramUsername || ''
    user.telegramFirstName = telegramFirstName || ''
    user.telegramLastName = telegramLastName || ''
    user.telegramPhotoUrl = telegramPhotoUrl || ''
    user.telegramVerified = true
    user.telegramConnected = true

    // Award social points for Telegram connection
    const pointsAwarded = 100
    user.socialPoints += pointsAwarded
    user.totalPoints = user.gamePoints + user.socialPoints + user.referralPoints

    await user.save()

    logger.info(`User ${walletAddress} connected Telegram account: ${telegramId}, awarded ${pointsAwarded} points`)

    res.status(200).json({
      success: true,
      message: 'Telegram connection verified successfully',
      data: {
        pointsAwarded,
        totalSocialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        telegramConnected: user.telegramConnected
      }
    })
  }
)

// Verify Telegram group join (called by admin bot)
export const verifyTelegramGroupJoin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, telegramId } = req.body

    if (!walletAddress || !telegramId) {
      return next(new AppError('Wallet address and Telegram ID are required', 400))
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Verify that the Telegram ID matches
    if (user.telegramId !== telegramId.toString()) {
      return next(new AppError('Telegram ID mismatch', 400))
    }

    // Check if already joined group
    if (user.telegramJoinedGroup) {
      return next(new AppError('User has already joined the group', 400))
    }

    // Mark as joined group and award points
    user.telegramJoined = true
    user.telegramJoinedGroup = true
    const pointsAwarded = 200
    user.socialPoints += pointsAwarded
    user.totalPoints = user.gamePoints + user.socialPoints + user.referralPoints

    await user.save()

    logger.info(`User ${walletAddress} joined Telegram group, awarded ${pointsAwarded} points`)

    res.status(200).json({
      success: true,
      message: 'Telegram group join verified successfully',
      data: {
        pointsAwarded,
        totalSocialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        telegramJoinedGroup: user.telegramJoinedGroup
      }
    })
  }
)

// Verify Telegram group join (frontend call)
export const verifyTelegramGroupJoinFrontend = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, groupUsername } = req.body

    if (!walletAddress || !groupUsername) {
      return next(new AppError('Wallet address and group username are required', 400))
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user has connected Telegram
    if (!user.telegramConnected) {
      return next(new AppError('User must connect Telegram account first', 400))
    }

    // Check if already joined group
    if (user.telegramJoinedGroup) {
      return next(new AppError('User has already joined the group', 400))
    }

    // For now, we'll trust the user and award points
    // In a real implementation, you would verify group membership via Telegram Bot API
    user.telegramJoined = true
    user.telegramJoinedGroup = true
    const pointsAwarded = 200
    user.socialPoints += pointsAwarded
    user.totalPoints = user.gamePoints + user.socialPoints + user.referralPoints

    await user.save()

    logger.info(`User ${walletAddress} joined Telegram group ${groupUsername}, awarded ${pointsAwarded} points`)

    res.status(200).json({
      success: true,
      message: 'Telegram group join verified successfully',
      data: {
        pointsAwarded,
        totalSocialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        telegramJoinedGroup: user.telegramJoinedGroup
      }
    })
  }
)

// Verify email connection
export const verifyEmailConnection = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, email, googleUserData } = req.body

    if (!walletAddress || !email) {
      return next(new AppError('Wallet address and email are required', 400))
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if already connected email
    if (user.emailConnected) {
      return next(new AppError('User has already connected email', 400))
    }

    // Mark as connected and award points
    user.emailConnected = true
    user.email = email
    
    // Store Google user data if provided
    if (googleUserData) {
      user.googleId = googleUserData.id
      user.googleName = googleUserData.name
      user.googlePicture = googleUserData.picture
      user.googleVerifiedEmail = googleUserData.verified_email
    }
    
    const pointsAwarded = 100
    user.socialPoints += pointsAwarded
    user.totalPoints = user.gamePoints + user.socialPoints + user.referralPoints

    await user.save()

    logger.info(`User ${walletAddress} connected email: ${email}, awarded ${pointsAwarded} points`)

    res.status(200).json({
      success: true,
      message: 'Email connection verified successfully',
      data: {
        pointsAwarded,
        totalSocialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        emailConnected: user.emailConnected
      }
    })
  }
)

// Get user quest progress
export const getUserQuestProgress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        socialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        // X/Twitter quests
        xConnected: user.xConnected,
        xFollowed: user.xFollowed,
        xReplied: user.xReplied,
        xReposted: user.xReposted,
        xPosted: user.xPosted,
        // Telegram quests
        telegramConnected: user.telegramConnected,
        telegramJoinedGroup: user.telegramJoinedGroup,
        // Email quests
        emailConnected: user.emailConnected
      }
    })
  }
)