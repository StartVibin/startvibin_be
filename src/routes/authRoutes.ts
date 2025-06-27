import { Router } from 'express'
import { authenticateWallet, getAuthMessage } from '@/controllers/authController'

const router = Router()

// GET /auth/message - Get authentication message for signing
router.get('/message', getAuthMessage)

// POST /auth/wallet - Authenticate with wallet signature
router.post('/wallet', authenticateWallet)

export default router 