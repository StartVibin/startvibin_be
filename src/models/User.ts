import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  walletAddress: string
  xJoined: boolean
  discordJoined: boolean
  telegramJoined: boolean
  xId: string
  discordId: string
  telegramId: string
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
  markSocialJoined(platform: 'x' | 'discord' | 'telegram'): void
}

interface IUserModel extends mongoose.Model<IUser> {
  findByWalletAddress(walletAddress: string): Promise<IUser | null>
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
    discordJoined: {
      type: Boolean,
      default: false
    },
    telegramJoined: {
      type: Boolean,
      default: false
    },
    xId: {
      type: String,
      default: '',
      trim: true
    },
    discordId: {
      type: String,
      default: '',
      trim: true
    },
    telegramId: {
      type: String,
      default: '',
      trim: true
    },
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
userSchema.index({ discordId: 1 })
userSchema.index({ telegramId: 1 })

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
  return [this.xJoined, this.discordJoined, this.telegramJoined]
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
userSchema.methods.markSocialJoined = function(platform: 'x' | 'discord' | 'telegram'): void {
  switch (platform) {
    case 'x':
      this.xJoined = true
      break
    case 'discord':
      this.discordJoined = true
      break
    case 'telegram':
      this.telegramJoined = true
      break
  }
}

// Static method to find user by wallet address
userSchema.statics.findByWalletAddress = function(walletAddress: string) {
  return this.findOne({ walletAddress: walletAddress.toLowerCase() })
}

// Static method to find user by social platform ID
userSchema.statics.findBySocialId = function(platform: 'x' | 'discord' | 'telegram', id: string) {
  const fieldMap = {
    x: 'xId',
    discord: 'discordId',
    telegram: 'telegramId'
  }
  return this.findOne({ [fieldMap[platform]]: id })
}

// Static method to get top users by total points
userSchema.statics.getTopUsers = function(limit: number = 10) {
  return this.find().sort({ gamePoints: -1, referralPoints: -1, socialPoints: -1 }).limit(limit)
}

const User = mongoose.model<IUser, IUserModel>('User', userSchema)

export default User 