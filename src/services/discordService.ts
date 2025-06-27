import axios from 'axios'
import { AppError } from '@/middleware/errorHandler'
import logger from '@/utils/logger'

interface DiscordMember {
  user: {
    id: string
    username: string
    discriminator: string
    avatar: string
  }
  roles: string[]
  joined_at: string
  premium_since?: string
  permissions: string
}

interface DiscordGuild {
  id: string
  name: string
  icon: string
  owner: boolean
  permissions: string
  features: string[]
}

class DiscordService {
  private botToken: string
  private guildId: string

  constructor() {
    this.botToken = process.env.DISCORD_BOT_TOKEN || ''
    this.guildId = process.env.DISCORD_GUILD_ID || ''
    
    if (!this.botToken) {
      logger.warn('Discord bot token not configured')
    }
    
    if (!this.guildId) {
      logger.warn('Discord guild ID not configured')
    }
  }

  /**
   * Verify if a user is a member of the Discord server
   */
  async verifyServerMembership(discordUserId: string): Promise<{
    isMember: boolean
    member?: DiscordMember
    guild?: DiscordGuild
    error?: string
  }> {
    try {
      if (!this.botToken || !this.guildId) {
        throw new AppError('Discord bot not configured', 500)
      }

      // Get guild member information
      const memberResponse = await axios.get(
        `https://discord.com/api/v10/guilds/${this.guildId}/members/${discordUserId}`,
        {
          headers: {
            'Authorization': `Bot ${this.botToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (memberResponse.status === 200) {
        const member: DiscordMember = memberResponse.data
        
        // Get guild information
        const guildResponse = await axios.get(
          `https://discord.com/api/v10/guilds/${this.guildId}`,
          {
            headers: {
              'Authorization': `Bot ${this.botToken}`,
              'Content-Type': 'application/json'
            }
          }
        )

        const guild: DiscordGuild = guildResponse.data

        logger.info(`Discord membership verified for user ${discordUserId} in guild ${guild.name}`)

        return {
          isMember: true,
          member,
          guild
        }
      }

      return {
        isMember: false,
        error: 'User is not a member of the server'
      }

    } catch (error: any) {
      if (error.response?.status === 404) {
        // User is not a member of the server
        return {
          isMember: false,
          error: 'User is not a member of the server'
        }
      }

      logger.error('Discord API error:', error.response?.data || error.message)
      
      return {
        isMember: false,
        error: 'Failed to verify Discord membership'
      }
    }
  }

  /**
   * Get server member count
   */
  async getServerMemberCount(): Promise<number> {
    try {
      if (!this.botToken || !this.guildId) {
        throw new AppError('Discord bot not configured', 500)
      }

      const response = await axios.get(
        `https://discord.com/api/v10/guilds/${this.guildId}`,
        {
          headers: {
            'Authorization': `Bot ${this.botToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.approximate_member_count || 0

    } catch (error: any) {
      logger.error('Failed to get server member count:', error.message)
      return 0
    }
  }

  /**
   * Get server information
   */
  async getServerInfo(): Promise<DiscordGuild | null> {
    try {
      if (!this.botToken || !this.guildId) {
        throw new AppError('Discord bot not configured', 500)
      }

      const response = await axios.get(
        `https://discord.com/api/v10/guilds/${this.guildId}`,
        {
          headers: {
            'Authorization': `Bot ${this.botToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data

    } catch (error: any) {
      logger.error('Failed to get server info:', error.message)
      return null
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(discordUserId: string, roleId: string): Promise<boolean> {
    try {
      const result = await this.verifyServerMembership(discordUserId)
      
      if (!result.isMember || !result.member) {
        return false
      }

      return result.member.roles.includes(roleId)

    } catch (error: any) {
      logger.error('Failed to check user role:', error.message)
      return false
    }
  }
}

export default new DiscordService() 