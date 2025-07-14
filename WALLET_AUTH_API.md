# Wallet Authentication API

This API provides wallet-based authentication using Ethereum signatures.

## Endpoints

### 1. Get Authentication Message

**GET** `/api/auth/message`

Get a unique message to sign for authentication.

**Query Parameters:**
- `walletAddress` (required): The Ethereum wallet address

**Example Request:**
```bash
GET /api/auth/message?walletAddress=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "message": "Sign this message to authenticate with BeatWise.\n\nWallet: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6\nTimestamp: 1703123456789\n\nThis signature will be used to verify your wallet ownership.",
    "walletAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6"
  }
}
```

### 2. Authenticate Wallet

**POST** `/api/auth/wallet`

Authenticate using wallet signature verification.

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "originalMessage": "Sign this message to authenticate with BeatWise.\n\nWallet: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6\nTimestamp: 1703123456789\n\nThis signature will be used to verify your wallet ownership.",
  "signedMessage": "0x..."
}
```

**Example Response (New User):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "walletAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
      "gamePoints": 0,
      "referralPoints": 0,
      "socialPoints": 0,
      "totalPoints": 0,
      "xConnected": false,
      "telegramVerified": false,
      "telegramJoined": false,
      "xId": "",
      "telegramId": "",
      "referralCode": "ABC12345",
      "isWhitelist": false,
      "createdAt": "2023-12-21T10:30:56.789Z",
      "updatedAt": "2023-12-21T10:30:56.789Z"
    },
    "isNewUser": true
  }
}
```

**Example Response (Existing User):**
```json
{
  "success": true,
  "message": "User authenticated successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "walletAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
      "gamePoints": 250,
      "referralPoints": 75,
      "socialPoints": 330,
      "totalPoints": 655,
      "xConnected": true,
      "telegramVerified": true,
      "telegramJoined": true,
      "xId": "1234567890",
      "telegramId": "987654321",
      "referralCode": "ABC12345",
      "isWhitelist": true,
      "createdAt": "2023-12-20T10:30:56.789Z",
      "updatedAt": "2023-12-21T10:30:56.789Z"
    },
    "isNewUser": false
  }
}
```

## Point System

The API uses a comprehensive point system with three types of points:

### Point Types:
- **Game Points**: Earned by completing game quests and challenges
- **Referral Points**: Earned through referral system (50 points for being referred, 25 points for referring someone)
- **Social Points**: Earned by completing social media quests (Twitter, Discord, Telegram)
- **Total Points**: Sum of all three point types (calculated automatically)

### Point Sources:
- **Social Quests**: 100-150 points + bonus (10-15 points)
- **Game Quests**: Variable points based on quest difficulty
- **Referrals**: 50 points for new user, 25 points for referrer

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Wallet address, original message, and signed message are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid signature. The signed message does not match the wallet address."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Authentication failed. Please try again."
}
```

## How It Works

1. **Get Message**: Client requests a unique message to sign using their wallet address
2. **Sign Message**: Client signs the message using their Ethereum wallet (MetaMask, etc.)
3. **Authenticate**: Client sends the wallet address, original message, and signed message
4. **Verify**: Server verifies the signature matches the wallet address
5. **Create/Login**: If verification passes, user is created (if new) or authenticated (if existing)

## Security Features

- **Signature Verification**: Uses Ethereum's `ethers.verifyMessage()` to verify signatures
- **Address Validation**: Validates wallet address format using `ethers.isAddress()`
- **Address Normalization**: Converts all addresses to lowercase for consistency
- **Unique Messages**: Each authentication message includes a timestamp for uniqueness
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes

## Frontend Integration Example

```javascript
// 1. Get authentication message
const response = await fetch('/api/auth/message?walletAddress=' + walletAddress);
const { data: { message } } = await response.json();

// 2. Sign message with wallet
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [message, walletAddress]
});

// 3. Authenticate
const authResponse = await fetch('/api/auth/wallet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress,
    originalMessage: message,
    signedMessage: signature
  })
});

const { data: { user, isNewUser } } = await authResponse.json();

// 4. Display user points
console.log(`Game Points: ${user.gamePoints}`);
console.log(`Referral Points: ${user.referralPoints}`);
console.log(`Social Points: ${user.socialPoints}`);
console.log(`Total Points: ${user.totalPoints}`);
``` 