import { Router } from 'express'
import { 
  addGamePoints, 
  getGameStats, 
  getTopPlayers, 
  getUserRank, 
  resetGamePoints,
  checkCanPlayGame,
  recordGamePlay
} from '@/controllers/gameController'

const router = Router()

// POST /game/points - Add game points and update high score
router.post('/points', addGamePoints)

// GET /game/stats/:walletAddress - Get user's game statistics
router.get('/stats/:walletAddress', getGameStats)

// GET /game/top - Get top players by high score
router.get('/top', getTopPlayers)

// GET /game/rank/:walletAddress - Get user's rank by high score
router.get('/rank/:walletAddress', getUserRank)

// DELETE /game/reset/:walletAddress - Reset user's game points (admin)
router.delete('/reset/:walletAddress', resetGamePoints)

// GET /game/can-play/:walletAddress - Check if user can play a game today
router.get('/can-play/:walletAddress', checkCanPlayGame)

// POST /game/record-play - Record a game play (call when game starts)
router.post('/record-play', recordGamePlay)

export default router 