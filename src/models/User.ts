import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  // Core user information
  walletAddress: string
  createdAt: Date
  updatedAt: Date
  
  // Social platform authentication flags
  xConnected: boolean
  telegramConnected: boolean
  emailConnected: boolean
  
  // Social platform verification flags
  telegramVerified: boolean
  telegramJoined: boolean
  telegramJoinedGroup: boolean
  xVerified: boolean
  
  // Social task completion flags
  xFollowed: boolean
  xReplied: boolean
  xReposted: boolean
  xPosted: boolean
  
  // X/Twitter user data
  xId: string
  xUsername: string
  xDisplayName: string
  xProfileImageUrl: string
  
  // Telegram user data
  telegramId: string
  telegramUsername: string
  telegramFirstName: string
  telegramLastName: string
  telegramPhotoUrl: string
  
  // Email and Google OAuth data
  email: string
  googleId: string
  googleName: string
  googlePicture: string
  googleVerifiedEmail: boolean
  
  // Invite system
  inviteCode: string
  invitedBy: string
  invitedUsers: string[]
  referralCode: string
  
  // Points and stats
  gamePoints: number
  referralPoints: number
  socialPoints: number
  totalPoints: number
  highScore: number
  isWhitelist: boolean
  
  // Daily game tracking
  dailyGamesPlayed: number
  lastGameDate: Date
  
  // Methods
  addGamePoints(amount: number): void
  addReferralPoints(amount: number): void
  addSocialPoints(amount: number): void
  markSocialJoined(platform: 'x' | 'telegram'): void
  canPlayGame(): boolean
  recordGamePlay(): void
}

interface IUserModel extends mongoose.Model<IUser> {
  findByWalletAddress(walletAddress: string): Promise<IUser | null>
  findByInviteCode(inviteCode: string): Promise<IUser | null>
  getTopUsers(limit?: number): Promise<IUser[]>
}

const userSchema = new Schema<IUser>(
  {
    // Core user information
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    
    // Social platform authentication flags
    xConnected: {
      type: Boolean,
      default: false
    },
    telegramConnected: {
      type: Boolean,
      default: false
    },
    emailConnected: {
      type: Boolean,
      default: false
    },
    
    // Social platform verification flags
    telegramVerified: {
      type: Boolean,
      default: false
    },
    telegramJoined: {
      type: Boolean,
      default: false
    },
    telegramJoinedGroup: {
      type: Boolean,
      default: false
    },
    xVerified: {
      type: Boolean,
      default: false
    },
    
    // Social task completion flags
    xFollowed: {
      type: Boolean,
      default: false
    },
    xReplied: {
      type: Boolean,
      default: false
    },
    xReposted: {
      type: Boolean,
      default: false
    },
    xPosted: {
      type: Boolean,
      default: false
    },
    
    // X/Twitter user data
    xId: {
      type: String,
      default: '',
      trim: true
    },
    xUsername: {
      type: String,
      default: '',
      trim: true
    },
    xDisplayName: {
      type: String,
      default: '',
      trim: true
    },
    xProfileImageUrl: {
      type: String,
      default: '',
      trim: true
    },
    
    // Telegram user data
    telegramId: {
      type: String,
      default: '',
      trim: true
    },
    telegramUsername: {
      type: String,
      default: '',
      trim: true
    },
    telegramFirstName: {
      type: String,
      default: '',
      trim: true
    },
    telegramLastName: {
      type: String,
      default: '',
      trim: true
    },
    telegramPhotoUrl: {
      type: String,
      default: '',
      trim: true
    },
    
    // Email and Google OAuth data
    email: {
      type: String,
      default: '',
      trim: true
    },
    googleId: {
      type: String,
      default: '',
      trim: true
    },
    googleName: {
      type: String,
      default: '',
      trim: true
    },
    googlePicture: {
      type: String,
      default: '',
      trim: true
    },
    googleVerifiedEmail: {
      type: Boolean,
      default: false
    },
    
    // Invite system
    inviteCode: {
      type: String,
      default: '',
      trim: true,
      unique: true,
      sparse: true
    },
    invitedBy: {
      type: String,
      default: '',
      trim: true
    },
    invitedUsers: {
      type: [String],
      default: []
    },
    referralCode: {
      type: String,
      default: '',
      trim: true
    },
    
    // Points and stats
    gamePoints: {
      type: Number,
      default: 0
    },
    referralPoints: {
      type: Number,
      default: 0
    },
    socialPoints: {
      type: Number,
      default: 0
    },
    highScore: {
      type: Number,
      default: 0
    },
    isWhitelist: {
      type: Boolean,
      default: false
    },
    
    // Daily game tracking
    dailyGamesPlayed: {
      type: Number,
      default: 0
    },
    lastGameDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

// Create compound index for efficient queries
userSchema.index({ walletAddress: 1, gamePoints: -1 })

// Index for social platform IDs
userSchema.index({ xId: 1 })
userSchema.index({ telegramId: 1 })

// Index for invite system
userSchema.index({ inviteCode: 1 })
userSchema.index({ invitedBy: 1 })

// Index for whitelist status
userSchema.index({ isWhitelist: 1 })

// Index for high score
userSchema.index({ highScore: -1 })

// Virtual for total points (sum of all point types)
userSchema.virtual('totalPoints').get(function() {
  return this.gamePoints + this.referralPoints + this.socialPoints
})

// Virtual for total social platforms joined
userSchema.virtual('totalSocialJoined').get(function() {
  return [this.xConnected, this.telegramJoined]
    .filter(Boolean).length
})

// Method to add game points
userSchema.methods.addGamePoints = function(amount: number): void {
  this.gamePoints += amount
}

// Method to add referral points
userSchema.methods.addReferralPoints = function(amount: number): void {
  this.referralPoints += amount
}

// Method to add social points
userSchema.methods.addSocialPoints = function(amount: number): void {
  this.socialPoints += amount
}

// Method to check if user can play a game today
userSchema.methods.canPlayGame = function(): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // If no last game date or last game was on a different day, reset counter
  if (!this.lastGameDate || this.lastGameDate < today) {
    this.dailyGamesPlayed = 0
    this.lastGameDate = today
  }
  
  return this.dailyGamesPlayed < 5
}

// Method to record a game play
userSchema.methods.recordGamePlay = function(): void {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // If no last game date or last game was on a different day, reset counter
  if (!this.lastGameDate || this.lastGameDate < today) {
    this.dailyGamesPlayed = 0
    this.lastGameDate = today
  }
  
  this.dailyGamesPlayed += 1
}

// Method to mark social platform as joined
userSchema.methods.markSocialJoined = function(platform: 'x' | 'telegram'): void {
  switch (platform) {
    case 'x':
      this.xConnected = true
      break
    case 'telegram':
      this.telegramJoined = true
      break
  }
}

// Method to generate unique invite code
userSchema.methods.generateInviteCode = function(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  this.inviteCode = result
  return result
}

// Method to add invited user
userSchema.methods.addInvitedUser = function(walletAddress: string): void {
  if (!this.invitedUsers.includes(walletAddress)) {
    this.invitedUsers.push(walletAddress)
  }
}

// Static method to find user by wallet address
userSchema.statics.findByWalletAddress = function(walletAddress: string) {
  return this.findOne({ walletAddress: walletAddress.toLowerCase() })
}

// Static method to find user by social platform ID
userSchema.statics.findBySocialId = function(platform: 'x' | 'telegram', id: string) {
  const fieldMap = {
    x: 'xId',
    telegram: 'telegramId'
  }
  return this.findOne({ [fieldMap[platform]]: id })
}

// Static method to find user by invite code
userSchema.statics.findByInviteCode = function(inviteCode: string) {
  return this.findOne({ inviteCode })
}

// Static method to get top users by total points
userSchema.statics.getTopUsers = function(limit: number = 10) {
  return this.find().sort({ gamePoints: -1, referralPoints: -1, socialPoints: -1 }).limit(limit)
}

const User = mongoose.model<IUser, IUserModel>('User', userSchema)

export default User 