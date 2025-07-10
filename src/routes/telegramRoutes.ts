import { Router } from 'express'
import { handleTelegramAuth, verifyTelegramGroupMembership } from '../controllers/telegramController'

const router = Router()

// Telegram authentication endpoint
router.post('/auth', handleTelegramAuth)

// Telegram group membership verification endpoint (for admin bot)
router.post('/verify-membership', verifyTelegramGroupMembership)

export default router 