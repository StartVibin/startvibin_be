import { Router } from 'express'
import questRoutes from './questRoutes'
import authRoutes from './authRoutes'
import referralRoutes from './referralRoutes'
import leaderboardRoutes from './leaderboardRoutes'
import gameRoutes from './gameRoutes'
import telegramRoutes from './telegramRoutes'

const router = Router()

// Health check
router.get('/health', (req, res) => {
    console.log("🚀 ~ router.get ~ health:")

    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    })
})

// API routes
router.use('/quests', questRoutes)
router.use('/auth', authRoutes)
router.use('/referrals', referralRoutes)
router.use('/leaderboard', leaderboardRoutes)
router.use('/game', gameRoutes)
router.use('/telegram', telegramRoutes)

export default router