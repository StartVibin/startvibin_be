import { Router } from 'express'
import { updateSpotifyData, getSpotifyData } from '@/controllers/spotifyController'

const router = Router()

// POST /spotify/update - Update user's Spotify data
router.post('/update', updateSpotifyData)

// GET /spotify/:walletAddress - Get user's Spotify data
router.get('/:walletAddress', getSpotifyData)

export default router 