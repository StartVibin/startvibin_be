export interface Quest {
  id: string
  platform: 'twitter' | 'telegram'
  title: string
  description: string
  points: number
  bonus: number
  icon: string
  status: 'active' | 'completed' | 'expired'
  createdAt: Date
  updatedAt: Date
}

export interface QuestResponse {
  success: boolean
  data: Quest[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CompleteQuestRequest {
  questId: string
  userId: string
  proof?: string
  metadata?: Record<string, any>
}

export interface SocialQuestRequest {
  userId: string
  twitterUsername?: string
  telegramUserId?: string
  xId?: string
  telegramId?: string
  proof?: string
  metadata?: Record<string, any>
}