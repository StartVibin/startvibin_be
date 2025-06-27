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
          points: 0,
          xJoined: false,
          discordJoined: false,
          telegramJoined: false,
          referralCode: generateReferralCode()
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
            xJoined: user.xJoined,
            discordJoined: user.discordJoined,
            telegramJoined: user.telegramJoined,
            xId: user.xId,
            discordId: user.discordId,
            telegramId: user.telegramId,
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