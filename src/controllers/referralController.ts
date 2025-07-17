import { Request, Response, NextFunction } from 'express'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import User from '@/models/User'
import logger from '@/utils/logger'

// Apply referral code
export const applyReferralCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, referralCode } = req.body

    if (!walletAddress || !referralCode) {
      return next(new AppError('Wallet address and referral code are required', 400))
    }

    // Find the user applying the referral code
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user already has a referral code
    if (user.referralCode && user.referralCode.trim() !== '') {
      return next(new AppError('User already has a referral code', 400))
    }

    // Find the referrer by invite code (referral codes are actually invite codes)
    const referrer = await User.findOne({ inviteCode: referralCode.toUpperCase() })
    if (!referrer) {
      return next(new AppError('Invalid referral code', 400))
    }

    // Check if user is trying to use their own referral code
    if (referrer.id === user.id) {
      return next(new AppError('Cannot use your own referral code', 400))
    }

    // Apply referral code and award points
    user.referralCode = referralCode.toUpperCase()
    user.invitedBy = referrer.walletAddress
    
    // Add user to referrer's invited users list
    if (!referrer.invitedUsers.includes(user.walletAddress)) {
      referrer.invitedUsers.push(user.walletAddress)
    }
    
    // Award points only to the referrer
    const referrerReward = 500 // Points for referring someone
    
    referrer.addReferralPoints(referrerReward)
    
    await user.save()
    await referrer.save()

    logger.info(`Referral applied: ${referrer.walletAddress} referred ${user.walletAddress}, both earned points`)

    res.status(200).json({
      success: true,
      message: 'Referral code applied successfully',
      data: {
        referralCode: user.referralCode,
        referralPoints: user.referralPoints,
        totalPoints: user.totalPoints,
        referrerReward
      }
    })
  }
)

// Get user's referral information
export const getReferralInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params

    if (!userId) {
      return next(new AppError('User ID is required', 400))
    }

    const user = await User.findById(userId)
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Count users who used this user's referral code
    const referredUsers = await User.countDocuments({ referralCode: user.referralCode })

    res.status(200).json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralPoints: user.referralPoints,
        referredUsers,
        totalPoints: user.totalPoints
      }
    })
  }
)

// Get top referrers
export const getTopReferrers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10

    const topReferrers = await User.find()
      .sort({ referralPoints: -1 })
      .limit(limit)
      .select('walletAddress referralPoints referralCode totalPoints')

    res.status(200).json({
      success: true,
      data: topReferrers
    })
  }
) 