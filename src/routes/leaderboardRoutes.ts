import { Router } from 'express'
import { getTopUsers, getUserRank, getLeaderboardByType } from '@/controllers/leaderboardController'

const router = Router()

// GET /leaderboard - Get top users by total points (default top 10)
router.get('/', getTopUsers)

// GET /leaderboard/rank/:walletAddress - Get specific user's rank
router.get('/rank/:walletAddress', getUserRank)

// GET /leaderboard/:type - Get leaderboard by point type (game, referral, social, total)
router.get('/:type', getLeaderboardByType)

export default router 