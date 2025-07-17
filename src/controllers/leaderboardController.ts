import { Request, Response, NextFunction } from 'express'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import User from '@/models/User'
import logger from '@/utils/logger'

// Get top users by total points
export const getTopUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10
    const page = parseInt(req.query.page as string) || 1
    const skip = (page - 1) * limit

    // Get users sorted by total points (gamePoints + referralPoints + socialPoints, excluding airdropped)
    const users = await User.aggregate([
      {
        $addFields: {
          totalPoints: {
            $add: ['$gamePoints', '$referralPoints', '$socialPoints']
          }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          walletAddress: 1,
          totalPoints: 1,
          gamePoints: 1,
          referralPoints: 1,
          socialPoints: 1,
          airdroped: 1,
          rank: { $add: [1, '$skip'] } // This will be calculated properly in the next step
        }
      }
    ])

    // Get total count for pagination
    const totalUsers = await User.countDocuments()

    // Add rank to each user
    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1
    }))

    logger.info(`Leaderboard requested: ${usersWithRank.length} users, page ${page}`)

    res.status(200).json({
      success: true,
      data: {
        users: usersWithRank,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    })
  }
)

// Get user's rank by wallet address
export const getUserRank = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Find the user
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Calculate user's total points (excluding airdropped)
    const userTotalPoints = user.gamePoints + user.referralPoints + user.socialPoints

    // Count users with higher total points (this gives us the rank)
    const rank = await User.aggregate([
      {
        $addFields: {
          totalPoints: {
            $add: ['$gamePoints', '$referralPoints', '$socialPoints']
          }
        }
      },
      {
        $match: {
          totalPoints: { $gt: userTotalPoints }
        }
      },
      {
        $count: 'count'
      }
    ])

    const userRank = (rank[0]?.count || 0) + 1

    // Get total users count
    const totalUsers = await User.countDocuments()

    logger.info(`User rank requested for ${walletAddress}: rank ${userRank}/${totalUsers}`)

    res.status(200).json({
      success: true,
              data: {
          walletAddress: user.walletAddress,
          totalPoints: userTotalPoints,
          gamePoints: user.gamePoints,
          referralPoints: user.referralPoints,
          socialPoints: user.socialPoints,
          airdroped: user.airdroped,
          rank: userRank,
          totalUsers
        }
    })
  }
)

// Get leaderboard by point type
export const getLeaderboardByType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.params
    const limit = parseInt(req.query.limit as string) || 10
    const page = parseInt(req.query.page as string) || 1
    const skip = (page - 1) * limit

    let sortField: string
    let pointType: string

    switch (type.toLowerCase()) {
      case 'game':
        sortField = 'gamePoints'
        pointType = 'gamePoints'
        break
      case 'referral':
        sortField = 'referralPoints'
        pointType = 'referralPoints'
        break
      case 'social':
        sortField = 'socialPoints'
        pointType = 'socialPoints'
        break
      case 'total':
        sortField = 'totalPoints'
        pointType = 'totalPoints'
        break
      default:
        return next(new AppError('Invalid point type. Use: game, referral, social, or total', 400))
    }

    let users
    let totalUsers

    if (type.toLowerCase() === 'total') {
      // For total points, we need to aggregate (excluding airdropped)
      users = await User.aggregate([
        {
          $addFields: {
            totalPoints: {
              $add: ['$gamePoints', '$referralPoints', '$socialPoints']
            }
          }
        },
        {
          $sort: { totalPoints: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $project: {
            walletAddress: 1,
            totalPoints: 1,
            gamePoints: 1,
            referralPoints: 1,
            socialPoints: 1,
            airdroped: 1
          }
        }
      ])

      totalUsers = await User.countDocuments()
    } else {
      // For specific point types, we can use regular query
      users = await User.find()
        .sort({ [sortField]: -1 })
        .skip(skip)
        .limit(limit)
        .select(`walletAddress ${pointType} gamePoints referralPoints socialPoints airdroped`)

      totalUsers = await User.countDocuments()
    }

    // Add rank to each user
    const usersWithRank = users.map((user, index) => ({
      ...user.toObject ? user.toObject() : user,
      rank: skip + index + 1
    }))

    logger.info(`${type} leaderboard requested: ${usersWithRank.length} users, page ${page}`)

    res.status(200).json({
      success: true,
      data: {
        type: type.toLowerCase(),
        users: usersWithRank,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    })
  }
) 