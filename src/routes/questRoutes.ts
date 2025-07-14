import { Router } from 'express'
import {
  verifyXConnection,
  verifyXFollow,
  verifyXReply,
  verifyXRepost,
  verifyXPost,
  verifyTelegramConnection,
  verifyTelegramGroupJoin,
  verifyTelegramGroupJoinFrontend,
  verifyEmailConnection,
  getUserQuestProgress
} from '../controllers/questController'

const router = Router()

// X/Twitter quest verification endpoints
router.post('/x/connect', verifyXConnection)
router.post('/x/follow', verifyXFollow)
router.post('/x/reply', verifyXReply)
router.post('/x/repost', verifyXRepost)
router.post('/x/post', verifyXPost)

// Telegram quest verification endpoints
router.post('/telegram/connect', verifyTelegramConnection)
router.post('/telegram/join-group', verifyTelegramGroupJoin)
router.post('/telegram/verify-group-join', verifyTelegramGroupJoinFrontend)

// Email quest verification endpoint
router.post('/email/connect', verifyEmailConnection)

// Get user quest progress
router.get('/progress/:walletAddress', getUserQuestProgress)

export default router