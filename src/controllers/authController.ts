import { Request, Response, NextFunction } from 'express'
import { ethers } from 'ethers'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import User from '@/models/User'
import { WalletAuthRequest, WalletAuthResponse, SignatureVerificationResult } from '@/types/auth'
import logger from '@/utils/logger'

// Verify Ethereum signature
function verifySignature(
  originalMessage: string,
  signedMessage: string,
  expectedAddress: string
): SignatureVerificationResult {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(originalMessage, signedMessage)
    
    // Check if the recovered address matches the expected address
    const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
    
    return {
      isValid,
      recoveredAddress: recoveredAddress.toLowerCase()
    }
  } catch (error) {
    logger.error('Signature verification failed:', error)
    return {
      isValid: false,
      recoveredAddress: ''
    }
  }
}

// Generate a unique message for signing
function generateAuthMessage(walletAddress: string): string {
  const timestamp = Date.now()
  return `Sign this message to authenticate with BeatWise.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nThis signature will be used to verify your wallet ownership.`
}

// Wallet authentication endpoint
export const authenticateWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, originalMessage, signedMessage }: WalletAuthRequest = req.body

    // Validate required fields
    if (!walletAddress || !originalMessage || !signedMessage) {
      return next(new AppError('Wallet address, original message, and signed message are required', 400))
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      return next(new AppError('Invalid wallet address format', 400))
    }

    // Verify the signature
    const verificationResult = verifySignature(originalMessage, signedMessage, walletAddress)
    
    if (!verificationResult.isValid) {
      return next(new AppError('Invalid signature. The signed message does not match the wallet address.', 401))
    }

    // Normalize wallet address to lowercase
    const normalizedAddress = walletAddress.toLowerCase()

    try {
      // Check if user already exists
      let user = await User.findByWalletAddress(normalizedAddress)
      let isNewUser = false

      if (!user) {
        // Create new user
        user = new User({
          walletAddress: normalizedAddress,
          xConnected: false,
          telegramVerified: false,
          telegramJoined: false,
          referralCode: generateReferralCode(),
          inviteCode: generateReferralCode() // Generate unique invite code
        })
        
        await user.save()
        isNewUser = true
        
        logger.info(`New user created with wallet address: ${normalizedAddress}`)
      } else {
        logger.info(`Existing user authenticated with wallet address: ${normalizedAddress}`)
      }

      // Prepare response
      const response: WalletAuthResponse = {
        success: true,
        message: isNewUser ? 'User registered successfully' : 'User authenticated successfully',
        data: {
          user: {
            id: user.id,
            walletAddress: user.walletAddress,
            gamePoints: user.gamePoints,
            referralPoints: user.referralPoints,
            socialPoints: user.socialPoints,
            totalPoints: user.totalPoints,
            airdroped: user.airdroped,
       
            telegramVerified: user.telegramVerified,
            telegramJoined: user.telegramJoined,
            // Social task completion flags
            xConnected: user.xConnected,
            xFollowed: user.xFollowed,
            xReplied: user.xReplied,
            xReposted: user.xReposted,
            xPosted: user.xPosted,
            telegramConnected: user.telegramConnected,
            telegramJoinedGroup: user.telegramJoinedGroup,
            emailConnected: user.emailConnected,
            spotifyConnected: user.spotifyConnected,
            xId: user.xId,
            telegramId: user.telegramId,
            // X/Twitter user data
            xUsername: user.xUsername,
            xDisplayName: user.xDisplayName,
            xProfileImageUrl: user.xProfileImageUrl,
            xVerified: user.xVerified,
            // Telegram user data
            telegramUsername: user.telegramUsername,
            telegramFirstName: user.telegramFirstName,
            telegramLastName: user.telegramLastName,
            telegramPhotoUrl: user.telegramPhotoUrl,
            // Spotify data
            spotifyId: user.spotifyId,
            spotifyEmail: user.spotifyEmail,
            // Invite system
            inviteCode: user.inviteCode,
            invitedBy: user.invitedBy,
            invitedUsers: user.invitedUsers,
            referralCode: user.referralCode,
            isWhitelist: user.isWhitelist,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          isNewUser
        }
      }

      res.status(200).json(response)

    } catch (error) {
      logger.error('Error during wallet authentication:', error)
      return next(new AppError('Authentication failed. Please try again.', 500))
    }
  }
)

// Get authentication message for signing
export const getAuthMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.query

    if (!walletAddress || typeof walletAddress !== 'string') {
      return next(new AppError('Wallet address is required', 400))
    }

    if (!ethers.isAddress(walletAddress)) {
      return next(new AppError('Invalid wallet address format', 400))
    }

    const message = generateAuthMessage(walletAddress)

    res.status(200).json({
      success: true,
      data: {
        message,
        walletAddress: walletAddress.toLowerCase()
      }
    })
  }
)

// Generate a unique referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Get user profile by wallet address
export const getUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      return next(new AppError('Invalid wallet address format', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress.toLowerCase())
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    res.status(200).json({
      success: true,
              data: {
          walletAddress: user.walletAddress,
          xConnected: user.xConnected,  
          telegramVerified: user.telegramVerified,
          telegramJoined: user.telegramJoined,
          // Social task completion flags
  
          xFollowed: user.xFollowed,
          xReplied: user.xReplied,
          xReposted: user.xReposted,
          xPosted: user.xPosted,
          telegramConnected: user.telegramConnected,
          telegramJoinedGroup: user.telegramJoinedGroup,
          emailConnected: user.emailConnected,
          spotifyConnected: user.spotifyConnected,
          xId: user.xId,
          telegramId: user.telegramId,
          // X/Twitter user data
          xUsername: user.xUsername,
          xDisplayName: user.xDisplayName,
          xProfileImageUrl: user.xProfileImageUrl,
          xVerified: user.xVerified,
          // Telegram user data
          telegramUsername: user.telegramUsername,
          telegramFirstName: user.telegramFirstName,
          telegramLastName: user.telegramLastName,
          telegramPhotoUrl: user.telegramPhotoUrl,
          // Spotify data
          spotifyId: user.spotifyId,
          spotifyEmail: user.spotifyEmail,
          // Invite system
          inviteCode: user.inviteCode,
          invitedBy: user.invitedBy,
          invitedUsers: user.invitedUsers,
          gamePoints: user.gamePoints,
          referralPoints: user.referralPoints,
          socialPoints: user.socialPoints,
          referralCode: user.referralCode,
          isWhitelist: user.isWhitelist,
          highScore: user.highScore,
          totalPoints: user.totalPoints,
          airdroped: user.airdroped,
          totalSocialJoined: [user.xConnected, user.telegramJoined].filter(Boolean).length,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
    })
  }
) 

// Get Telegram user data by wallet address
export const getTelegramUserData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      return next(new AppError('Invalid wallet address format', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress.toLowerCase())
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user has Telegram data
    if (!user.telegramJoined || !user.telegramId) {
      return next(new AppError('User has not connected Telegram', 404))
    }

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        telegramFirstName: user.telegramFirstName,
        telegramLastName: user.telegramLastName,
        telegramPhotoUrl: user.telegramPhotoUrl,
        telegramVerified: user.telegramVerified,
        telegramJoined: user.telegramJoined,
        telegramJoinedAt: user.updatedAt // Assuming this is when they joined
      }
    })
  }
) 