import { Request, Response, NextFunction } from 'express'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import User from '@/models/User'
import logger from '@/utils/logger'

export const handleTelegramAuth = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        console.log('Received Telegram auth request:', req.body)
        
        const { telegramData, walletAddress } = req.body
        
        if (!telegramData || !walletAddress) {
            return next(new AppError('Missing telegram data or wallet address', 400))
        }

        console.log('Telegram data:', telegramData)
        console.log('Wallet address:', walletAddress)

        // Save or update user in database
        let user = await User.findOne({ walletAddress })
        
        if (user) {
            // Update existing user with Telegram data
            user.telegramId = telegramData.id
            user.telegramVerified = true
            user.telegramUsername = telegramData.username || ''
            user.telegramFirstName = telegramData.first_name || ''
            user.telegramLastName = telegramData.last_name || ''
            user.telegramPhotoUrl = telegramData.photo_url || ''
            
            await user.save()
            logger.info(`Updated existing user with Telegram data: ${user._id}`)
        } else {
            // Create new user with Telegram data
            user = new User({
                walletAddress,
                telegramId: telegramData.id,
                telegramVerified: true,
                telegramUsername: telegramData.username || '',
                telegramFirstName: telegramData.first_name || '',
                telegramLastName: telegramData.last_name || '',
                telegramPhotoUrl: telegramData.photo_url || ''
            })
            
            await user.save()
            logger.info(`Created new user with Telegram data: ${user._id}`)
        }

        res.status(200).json({
            success: true,
            message: 'Telegram data saved successfully',
            user: {
                id: user._id,
                walletAddress: user.walletAddress,
                telegramId: user.telegramId,
                telegramVerified: user.telegramVerified,
                telegramJoined: user.telegramJoined,
                telegramUsername: user.telegramUsername,
                telegramFirstName: user.telegramFirstName,
                telegramLastName: user.telegramLastName,
                telegramPhotoUrl: user.telegramPhotoUrl
            }
        })
    }
)

// Verify Telegram group membership (called by admin bot)
export const verifyTelegramGroupMembership = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { telegramId, walletAddress } = req.body
        
        if (!telegramId || !walletAddress) {
            return next(new AppError('Telegram ID and wallet address are required', 400))
        }

        // Find user by wallet address
        const user = await User.findOne({ walletAddress })
        if (!user) {
            return next(new AppError('User not found', 404))
        }

        // Verify that the Telegram ID matches
        if (user.telegramId !== telegramId.toString()) {
            return next(new AppError('Telegram ID mismatch', 400))
        }

        // Mark user as joined the group
        user.telegramJoined = true
        await user.save()

        logger.info(`User ${walletAddress} verified as Telegram group member: ${telegramId}`)

        res.status(200).json({
            success: true,
            message: 'Telegram group membership verified successfully',
            user: {
                id: user._id,
                walletAddress: user.walletAddress,
                telegramId: user.telegramId,
                telegramVerified: user.telegramVerified,
                telegramJoined: user.telegramJoined,
                telegramUsername: user.telegramUsername,
                telegramFirstName: user.telegramFirstName,
                telegramLastName: user.telegramLastName,
                telegramPhotoUrl: user.telegramPhotoUrl
            }
        })
    }
) 