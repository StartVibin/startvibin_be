import { Router } from 'express'
import { applyReferralCode, getReferralInfo, getTopReferrers } from '@/controllers/referralController'

const router = Router()

// POST /referrals/apply - Apply a referral code
router.post('/apply', applyReferralCode)

// GET /referrals/info/:userId - Get user's referral information
router.get('/info/:userId', getReferralInfo)

// GET /referrals/top - Get top referrers
router.get('/top', getTopReferrers)

export default router 