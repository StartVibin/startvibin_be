import { Router } from 'express'
import { getXPostId, getPublicConfig } from '@/controllers/configController'

const router = Router()

// GET /config/x-post-id - Get X Post ID
router.get('/x-post-id', getXPostId)

// GET /config/public - Get public configuration values
router.get('/public', getPublicConfig)

export default router 