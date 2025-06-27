import { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import { AppError, catchAsync } from '@/middleware/errorHandler'
import { Quest, QuestResponse, CompleteQuestRequest, SocialQuestRequest } from '@/types/quest'
import User from '@/models/User'
import discordService from '@/services/discordService'
import logger from '@/utils/logger'

// Mock data (replace with database queries)
const mockQuests: Quest[] = [
  {
    id: '1',
    platform: 'twitter',
    title: 'Follow XLayer on X',
    description: 'Follow our X (Twitter) account to earn social points',
    points: 100,
    bonus: 10,
    icon: '𝕏',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    platform: 'discord',
    title: 'Join XLayer Discord',
    description: 'Join our Discord server and introduce yourself',
    points: 150,
    bonus: 15,
    icon: '💬',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    platform: 'telegram',
    title: 'Join XLayer Telegram',
    description: 'Join our Telegram channel for updates and rewards',
    points: 120,
    bonus: 12,
    icon: '📱',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const getAllQuests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const status = req.query.status as string

    // Filter quests (add database query here)
    let filteredQuests = mockQuests
    if (status) {
      filteredQuests = mockQuests.filter(quest => quest.status === status)
    }

    const response: QuestResponse = {
      success: true,
      data: filteredQuests,
      pagination: {
        page,
        limit,
        total: filteredQuests.length,
        totalPages: Math.ceil(filteredQuests.length / limit),
      },
    }

    res.status(200).json(response)
  }
)

export const getQuestById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    // Find quest (add database query here)
    const quest = mockQuests.find(q => q.id === id)

    if (!quest) {
      return next(new AppError('No quest found with that ID', 404))
    }

    res.status(200).json({
      success: true,
      data: quest,
    })
  }
)

// X (Twitter) Follow Quest API
export const completeTwitterQuest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, twitterUsername, proof, xId }: SocialQuestRequest = req.body

    if (!userId) {
      return next(new AppError('User ID is required', 400))
    }

    if (!twitterUsername) {
      return next(new AppError('Twitter username is required', 400))
    }

    // Find Twitter quest
    const quest = mockQuests.find(q => q.platform === 'twitter' && q.status === 'active')
    if (!quest) {
      return next(new AppError('Twitter quest not found or inactive', 404))
    }

    // Find user and award social points (no verification needed since frontend already checked)
    const user = await User.findById(userId)
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user already completed X task
    if (user.xJoined) {
      return next(new AppError('X (Twitter) task already completed', 400))
    }

    // Award social points (100 points for X task)
    const reward = 100
    user.addSocialPoints(reward)
    user.markSocialJoined('x')
    
    // Store X ID if provided
    if (xId) {
      user.xId = xId
    }
    
    await user.save()

    logger.info(`X task completed by user: ${userId}, earned: ${reward} social points`)

    res.status(200).json({
      success: true,
      message: 'X (Twitter) task completed successfully',
      data: {
        questId: quest.id,
        questTitle: quest.title,
        reward,
        socialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        twitterUsername,
        xId: user.xId,
        xJoined: user.xJoined
      },
    })
  }
)

// Discord Join Quest API
export const completeDiscordQuest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, discordUserId, proof, discordId }: SocialQuestRequest = req.body

    if (!userId) {
      return next(new AppError('User ID is required', 400))
    }

    if (!discordUserId) {
      return next(new AppError('Discord user ID is required', 400))
    }

    // Find Discord quest
    const quest = mockQuests.find(q => q.platform === 'discord' && q.status === 'active')
    if (!quest) {
      return next(new AppError('Discord quest not found or inactive', 404))
    }

    // Verify Discord membership using Discord service
    const membershipResult = await discordService.verifyServerMembership(discordUserId)
    
    if (!membershipResult.isMember) {
      return next(new AppError(membershipResult.error || 'Discord membership verification failed', 400))
    }

    // Find user and award social points
    const user = await User.findById(userId)
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Award social points
    const reward = quest.points + quest.bonus
    user.addSocialPoints(reward)
    user.markSocialJoined('discord')
    
    // Store Discord ID if provided
    if (discordId) {
      user.discordId = discordId
    }
    
    await user.save()

    logger.info(`Discord quest completed by user: ${userId}, earned: ${reward} social points`)

    res.status(200).json({
      success: true,
      message: 'Discord join quest completed successfully',
      data: {
        questId: quest.id,
        questTitle: quest.title,
        reward,
        points: quest.points,
        bonus: quest.bonus,
        socialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        discordUserId,
        discordId: user.discordId,
        discordMember: membershipResult.member
      },
    })
  }
)

// Telegram Join Quest API
export const completeTelegramQuest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, telegramUserId, proof, telegramId }: SocialQuestRequest = req.body

    if (!userId) {
      return next(new AppError('User ID is required', 400))
    }

    if (!telegramUserId) {
      return next(new AppError('Telegram user ID is required', 400))
    }

    // Find Telegram quest
    const quest = mockQuests.find(q => q.platform === 'telegram' && q.status === 'active')
    if (!quest) {
      return next(new AppError('Telegram quest not found or inactive', 404))
    }

    // Verify Telegram membership (implement actual verification)
    const isVerified = await verifyTelegramMembership(telegramUserId, proof)
    
    if (!isVerified) {
      return next(new AppError('Telegram membership verification failed', 400))
    }

    // Find user and award social points
    const user = await User.findById(userId)
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Award social points
    const reward = quest.points + quest.bonus
    user.addSocialPoints(reward)
    user.markSocialJoined('telegram')
    
    // Store Telegram ID if provided
    if (telegramId) {
      user.telegramId = telegramId
    }
    
    await user.save()

    logger.info(`Telegram quest completed by user: ${userId}, earned: ${reward} social points`)

    res.status(200).json({
      success: true,
      message: 'Telegram join quest completed successfully',
      data: {
        questId: quest.id,
        questTitle: quest.title,
        reward,
        points: quest.points,
        bonus: quest.bonus,
        socialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        telegramUserId,
        telegramId: user.telegramId
      },
    })
  }
)

// Get user points
export const getUserPoints = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params

    if (!userId) {
      return next(new AppError('User ID is required', 400))
    }

    // Find user in database
    const user = await User.findById(userId)
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    res.status(200).json({
      success: true,
      data: {
        userId,
        gamePoints: user.gamePoints,
        referralPoints: user.referralPoints,
        socialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
      },
    })
  }
)

// Complete quest endpoint
export const completeQuest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { questId, userId, proof, metadata }: CompleteQuestRequest = req.body

    if (!questId || !userId) {
      return next(new AppError('Quest ID and User ID are required', 400))
    }

    // Find quest (add database query here)
    const quest = mockQuests.find(q => q.id === questId && q.status === 'active')
    if (!quest) {
      return next(new AppError('Quest not found or inactive', 404))
    }

    // Find user in database
    const user = await User.findById(userId)
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Verify quest completion (implement actual verification)
    const isVerified = await verifyQuestCompletion(quest, proof, metadata)
    
    if (!isVerified) {
      return next(new AppError('Quest completion verification failed', 400))
    }

    // Award game points (add database logic here)
    const reward = quest.points + quest.bonus
    user.addGamePoints(reward)
    await user.save()

    logger.info(`Quest completed by user: ${userId}, quest: ${quest.title}, earned: ${reward} game points`)

    res.status(200).json({
      success: true,
      message: 'Quest completed successfully',
      data: {
        questId: quest.id,
        questTitle: quest.title,
        reward,
        points: quest.points,
        bonus: quest.bonus,
        gamePoints: user.gamePoints,
        totalPoints: user.totalPoints,
      },
    })
  }
)

// Helper function to verify quest completion
async function verifyQuestCompletion(
  quest: Quest, 
  proof?: string, 
  metadata?: Record<string, any>
): Promise<boolean> {
  switch (quest.platform) {
    case 'twitter':
      // Verify Twitter interaction using Twitter API
      return verifyTwitterQuest(quest, proof, metadata)
    
    case 'discord':
      // Verify Discord membership using Discord API
      return verifyDiscordQuest(quest, proof, metadata)
    
    case 'telegram':
      // Verify Telegram interaction using Telegram API
      return verifyTelegramQuest(quest, proof, metadata)
    
    default:
      return false
  }
}

async function verifyTwitterQuest(
  quest: Quest, 
  proof?: string, 
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    // Example: Verify retweet using Twitter API
    // const response = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}/retweeted_by`, {
    //   headers: { 'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    // })
    
    // For now, return true (implement actual verification)
    return true
  } catch (error) {
    logger.error('Twitter verification failed:', error)
    return false
  }
}

async function verifyDiscordQuest(
  quest: Quest, 
  proof?: string, 
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    // Example: Verify Discord server membership
    // const response = await axios.get(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
    //   headers: { 'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}` }
    // })
    
    return true
  } catch (error) {
    logger.error('Discord verification failed:', error)
    return false
  }
}

async function verifyTelegramQuest(
  quest: Quest, 
  proof?: string, 
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    // Example: Verify Telegram channel membership
    // const response = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatMember`, {
    //   params: { chat_id: chatId, user_id: userId }
    // })
    
    return true
  } catch (error) {
    logger.error('Telegram verification failed:', error)
    return false
  }
}

// Specific verification functions for each platform
async function verifyTwitterFollow(
  twitterUsername: string, 
  proof?: string
): Promise<boolean> {
  try {
    // Implement Twitter API verification
    // Check if user follows the target account
    // const response = await axios.get(`https://api.twitter.com/2/users/by/username/${twitterUsername}/following`, {
    //   headers: { 'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    // })
    
    // For now, return true (implement actual verification)
    logger.info(`Verifying Twitter follow for: ${twitterUsername}`)
    return true
  } catch (error) {
    logger.error('Twitter follow verification failed:', error)
    return false
  }
}

async function verifyDiscordMembership(
  discordUserId: string, 
  proof?: string
): Promise<boolean> {
  try {
    // Implement Discord API verification
    // Check if user is member of the server
    // const response = await axios.get(`https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordUserId}`, {
    //   headers: { 'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}` }
    // })
    
    logger.info(`Verifying Discord membership for: ${discordUserId}`)
    return true
  } catch (error) {
    logger.error('Discord membership verification failed:', error)
    return false
  }
}

async function verifyTelegramMembership(
  telegramUserId: string, 
  proof?: string
): Promise<boolean> {
  try {
    // Implement Telegram API verification
    // Check if user is member of the channel
    // const response = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatMember`, {
    //   params: { 
    //     chat_id: process.env.TELEGRAM_CHANNEL_ID, 
    //     user_id: telegramUserId 
    //   }
    // })
    
    logger.info(`Verifying Telegram membership for: ${telegramUserId}`)
    return true
  } catch (error) {
    logger.error('Telegram membership verification failed:', error)
    return false
  }
}

// Simple X (Twitter) task completion by wallet address
export const completeXTaskByWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, xId }: { walletAddress: string; xId?: string } = req.body

    if (!walletAddress) {
      return next(new AppError('Wallet address is required', 400))
    }

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress)
    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Check if user already completed X task
    if (user.xJoined) {
      return next(new AppError('X (Twitter) task already completed', 400))
    }

    // Award social points (100 points for X task)
    const reward = 100
    user.addSocialPoints(reward)
    user.markSocialJoined('x')
    
    // Store X ID if provided
    if (xId) {
      user.xId = xId
    }
    
    await user.save()

    logger.info(`X task completed by wallet: ${walletAddress}, earned: ${reward} social points`)

    res.status(200).json({
      success: true,
      message: 'X (Twitter) task completed successfully',
      data: {
        walletAddress: user.walletAddress,
        reward,
        socialPoints: user.socialPoints,
        totalPoints: user.totalPoints,
        xJoined: user.xJoined,
        xId: user.xId
      },
    })
  }
)