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
      xJoined: boolean
      discordJoined: boolean
      telegramJoined: boolean
      xId: string
      discordId: string
      telegramId: string
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