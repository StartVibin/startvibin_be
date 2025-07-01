import { Router } from 'express'
import { authenticateWallet, getAuthMessage, getUserProfile } from '@/controllers/authController'
import { profileLimiter, strictLimiter } from '@/middleware/rateLimiter'

const router = Router()

// GET /auth/message - Get authentication message for signing
router.get('/message', strictLimiter, getAuthMessage)

// POST /auth/wallet - Authenticate with wallet signature
router.post('/wallet', strictLimiter, authenticateWallet)

// GET /auth/profile/:walletAddress - Get user profile by wallet address
router.get('/profile/:walletAddress', profileLimiter, getUserProfile)

export default router 