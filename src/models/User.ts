import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  walletAddress: string
  xJoined: boolean
  telegramVerified: boolean
  telegramJoined: boolean
  // Social task completion flags
  xConnected: boolean
  xFollowed: boolean
  xReplied: boolean
  xReposted: boolean
  xPosted: boolean
  telegramConnected: boolean
  telegramJoinedGroup: boolean
  emailConnected: boolean
  xId: string
  telegramId: string
  // X/Twitter user data
  xUsername: string
  xDisplayName: string
  xProfileImageUrl: string
  xVerified: boolean
  // Telegram user data
  telegramUsername: string
  telegramFirstName: string
  telegramLastName: string
  telegramPhotoUrl: string
  // Invite system
  inviteCode: string
  invitedBy: string
  invitedUsers: string[]
  // Points and stats
  gamePoints: number
  referralPoints: number
  socialPoints: number
  referralCode: string
  isWhitelist: boolean
  highScore: number
  createdAt: Date
  updatedAt: Date
  totalPoints: number
  addGamePoints(amount: number): void
  addReferralPoints(amount: number): void
  addSocialPoints(amount: number): void
  markSocialJoined(platform: 'x' | 'telegram'): void
}

interface IUserModel extends mongoose.Model<IUser> {
  findByWalletAddress(walletAddress: string): Promise<IUser | null>
  findByInviteCode(inviteCode: string): Promise<IUser | null>
  getTopUsers(limit?: number): Promise<IUser[]>
}

const userSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    xJoined: {
      type: Boolean,
      default: false
    },
    telegramVerified: {
      type: Boolean,
      default: false
    },
    telegramJoined: {
      type: Boolean,
      default: false
    },
    // Social task completion flags
    xConnected: {
      type: Boolean,
      default: false
    },
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
    telegramConnected: {
      type: Boolean,
      default: false
    },
    telegramJoinedGroup: {
      type: Boolean,
      default: false
    },
    emailConnected: {
      type: Boolean,
      default: false
    },
    xId: {
      type: String,
      default: '',
      trim: true
    },
    telegramId: {
      type: String,
      default: '',
      trim: true
    },
    // X/Twitter user data
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
    xVerified: {
      type: Boolean,
      default: false
    },
    // Telegram user data
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
    invitedUsers: [{
      type: String,
      trim: true
    }],
    gamePoints: {
      type: Number,
      default: 0,
      min: 0
    },
    referralPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    socialPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    referralCode: {
      type: String,
      default: '',
      trim: true
    },
    isWhitelist: {
      type: Boolean,
      default: false
    },
    highScore: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      }
    }
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
  return [this.xJoined, this.telegramVerified]
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

// Method to mark social platform as joined
userSchema.methods.markSocialJoined = function(platform: 'x' | 'telegram'): void {
  switch (platform) {
    case 'x':
      this.xJoined = true
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