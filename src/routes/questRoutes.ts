import { Router } from 'express'
import { 
  getAllQuests, 
  getQuestById, 
  completeQuest,
  completeTwitterQuest,
  completeDiscordQuest,
  completeTelegramQuest,
  getUserPoints,
  completeXTaskByWallet
} from '@/controllers/questController'
import { apiLimiter } from '@/middleware/rateLimiter'

const router = Router()

// All routes are now public
router.get('/', getAllQuests)
router.get('/:id', getQuestById)
router.get('/user/:userId/points', getUserPoints)

// Social quest completion endpoints
router.post('/twitter/complete', apiLimiter, completeTwitterQuest)
router.post('/discord/complete', apiLimiter, completeDiscordQuest)
router.post('/telegram/complete', apiLimiter, completeTelegramQuest)

// Generic quest completion endpoint
router.post('/complete', apiLimiter, completeQuest)

// POST /quests/x-task - Complete X task by wallet address (simple)
router.post('/x-task', completeXTaskByWallet)

export default router