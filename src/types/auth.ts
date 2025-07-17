export interface WalletAuthRequest {
  walletAddress: string
  originalMessage: string
  signedMessage: string
}

export interface WalletAuthResponse {
  success: boolean
  message: string
  data: {
          user: {
        id: string
        walletAddress: string
        gamePoints: number
        referralPoints: number
        socialPoints: number
        totalPoints: number
        airdroped: number
        xConnected: boolean
        telegramVerified: boolean
        telegramJoined: boolean
        // Social task completion flags
        xFollowed: boolean
        xReplied: boolean
        xReposted: boolean
        xPosted: boolean
        telegramConnected: boolean
        telegramJoinedGroup: boolean
        emailConnected: boolean
        spotifyConnected: boolean
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
        // Spotify data
        spotifyId: string
        spotifyEmail: string
        // Invite system
        inviteCode: string
        invitedBy: string
        invitedUsers: string[]
        referralCode: string
        isWhitelist: boolean
        createdAt: Date
        updatedAt: Date
      }
    isNewUser: boolean
  }
}

export interface SignatureVerificationResult {
  isValid: boolean
  recoveredAddress: string
}

export interface TelegramUserData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export interface TelegramAuthRequest {
  telegramData: TelegramUserData
  walletAddress: string
}

export interface TelegramMembershipVerificationRequest {
  telegramId: number
  walletAddress: string
} 

export interface UserProfile {
  walletAddress: string
  telegramVerified: boolean
  telegramJoined: boolean
  xConnected: boolean
  xFollowed: boolean
  xReplied: boolean
  xReposted: boolean
  xPosted: boolean
  telegramConnected: boolean
  telegramJoinedGroup: boolean
  emailConnected: boolean
  spotifyConnected: boolean
  xId: string
  telegramId: string
  xUsername: string
  xDisplayName: string
  xProfileImageUrl: string
  xVerified: boolean
  telegramUsername: string
  telegramFirstName: string
  telegramLastName: string
  telegramPhotoUrl: string
  email: string
  googleId: string
  googleName: string
            googlePicture: string
  googleVerifiedEmail: boolean
  spotifyId: string
  spotifyEmail: string
  inviteCode: string
  invitedBy: string
  invitedUsers: string[]
  gamePoints: number
  referralPoints: number
  socialPoints: number
  referralCode: string
  isWhitelist: boolean
  highScore: number
  airdroped: number
  createdAt: Date
  updatedAt: Date
  totalPoints: number
} 