import { Request, Response, NextFunction } from 'express'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import discordService from '@/services/discordService'
import User from '@/models/User'
import logger from '@/utils/logger'

// Verify Discord server membership
export const verifyDiscordMembership = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { discordUserId, userId } = req.body

    if (!discordUserId) {
      return next(new AppError('Discord user ID is required', 400))
    }

    // Verify Discord membership
    const membershipResult = await discordService.verifyServerMembership(discordUserId)
    
    if (!membershipResult.isMember) {
      return next(new AppError(membershipResult.error || 'User is not a member of the Discord server', 400))
    }

    // If userId is provided, update user's Discord ID
    if (userId) {
      const user = await User.findById(userId)
      if (user) {
        user.discordId = discordUserId
        user.discordJoined = true
        await user.save()
        
        logger.info(`Updated Discord ID for user ${userId}: ${discordUserId}`)
      }
    }

    res.status(200).json({
      success: true,
      message: 'Discord membership verified successfully',
      data: {
        isMember: true,
        discordUserId,
        member: membershipResult.member,
        guild: membershipResult.guild
      }
    })
  }
)

// Get Discord server information
export const getDiscordServerInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const serverInfo = await discordService.getServerInfo()
    const memberCount = await discordService.getServerMemberCount()

    if (!serverInfo) {
      return next(new AppError('Failed to get Discord server information', 500))
    }

    res.status(200).json({
      success: true,
      data: {
        server: serverInfo,
        memberCount
      }
    })
  }
)

// Check if user has specific Discord role
export const checkDiscordRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { discordUserId, roleId } = req.params

    if (!discordUserId || !roleId) {
      return next(new AppError('Discord user ID and role ID are required', 400))
    }

    const hasRole = await discordService.hasRole(discordUserId, roleId)

    res.status(200).json({
      success: true,
      data: {
        discordUserId,
        roleId,
        hasRole
      }
    })
  }
)

// Get user's Discord roles
export const getUserDiscordRoles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { discordUserId } = req.params

    if (!discordUserId) {
      return next(new AppError('Discord user ID is required', 400))
    }

    const membershipResult = await discordService.verifyServerMembership(discordUserId)
    
    if (!membershipResult.isMember) {
      return next(new AppError('User is not a member of the Discord server', 400))
    }

    res.status(200).json({
      success: true,
      data: {
        discordUserId,
        roles: membershipResult.member?.roles || [],
        member: membershipResult.member
      }
    })
  }
) 