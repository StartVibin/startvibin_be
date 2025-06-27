import { Router } from 'express'
import { 
  verifyDiscordMembership, 
  getDiscordServerInfo, 
  checkDiscordRole, 
  getUserDiscordRoles 
} from '@/controllers/discordController'

const router = Router()

// POST /discord/verify - Verify Discord server membership
router.post('/verify', verifyDiscordMembership)

// GET /discord/server - Get Discord server information
router.get('/server', getDiscordServerInfo)

// GET /discord/roles/:discordUserId - Get user's Discord roles
router.get('/roles/:discordUserId', getUserDiscordRoles)

// GET /discord/role/:discordUserId/:roleId - Check if user has specific role
router.get('/role/:discordUserId/:roleId', checkDiscordRole)

export default router 