import { Router } from 'express'
import { authenticateWallet, getAuthMessage, getUserProfile, getTelegramUserData } from '@/controllers/authController'
import { profileLimiter, strictLimiter } from '@/middleware/rateLimiter'

const router = Router()

// GET /auth/message - Get authentication message for signing
router.get('/message', strictLimiter, getAuthMessage)

// POST /auth/wallet - Authenticate with wallet signature
router.post('/wallet', strictLimiter, authenticateWallet)

// GET /auth/profile/:walletAddress - Get user profile by wallet address
router.get('/profile/:walletAddress', profileLimiter, getUserProfile)

// GET /auth/telegram/:walletAddress - Get Telegram user data by wallet address
router.get('/telegram/:walletAddress', profileLimiter, getTelegramUserData)

export default router 