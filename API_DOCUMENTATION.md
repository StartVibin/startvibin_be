# Social Quest APIs Documentation

This document describes the APIs for completing social quests and earning points.

## Base URL
```
http://localhost:5000/api/v1/quests
```

## Available Quests

### 1. X (Twitter) Follow Quest
- **Points**: 100 + 10 bonus = 110 total
- **Description**: Follow our X (Twitter) account to earn points

### 2. Discord Join Quest
- **Points**: 150 + 15 bonus = 165 total
- **Description**: Join our Discord server and introduce yourself

### 3. Telegram Join Quest
- **Points**: 120 + 12 bonus = 132 total
- **Description**: Join our Telegram channel for updates and rewards

## API Endpoints

### 1. Complete X (Twitter) Follow Quest
**POST** `/twitter/complete`

**Request Body:**
```json
{
  "userId": "user123",
  "twitterUsername": "john_doe",
  "proof": "optional_proof_data"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Twitter follow quest completed successfully",
  "data": {
    "questId": "1",
    "questTitle": "Follow XLayer on X",
    "reward": 110,
    "points": 100,
    "bonus": 10,
    "totalPoints": 110,
    "twitterUsername": "john_doe"
  }
}
```

### 2. Complete Discord Join Quest
**POST** `/discord/complete`

**Request Body:**
```json
{
  "userId": "user123",
  "discordUserId": "123456789012345678",
  "proof": "optional_proof_data"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Discord join quest completed successfully",
  "data": {
    "questId": "2",
    "questTitle": "Join XLayer Discord",
    "reward": 165,
    "points": 150,
    "bonus": 15,
    "totalPoints": 275,
    "discordUserId": "123456789012345678"
  }
}
```

### 3. Complete Telegram Join Quest
**POST** `/telegram/complete`

**Request Body:**
```json
{
  "userId": "user123",
  "telegramUserId": "987654321",
  "proof": "optional_proof_data"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Telegram join quest completed successfully",
  "data": {
    "questId": "3",
    "questTitle": "Join XLayer Telegram",
    "reward": 132,
    "points": 120,
    "bonus": 12,
    "totalPoints": 407,
    "telegramUserId": "987654321"
  }
}
```

### 4. Get User Points
**GET** `/user/:userId/points`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "points": 407
  }
}
```

### 5. Get All Quests
**GET** `/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "platform": "twitter",
      "title": "Follow XLayer on X",
      "description": "Follow our X (Twitter) account to earn points",
      "points": 100,
      "bonus": 10,
      "icon": "𝕏",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "User ID is required",
  "statusCode": 400
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Twitter quest not found or inactive",
  "statusCode": 404
}
```

## Implementation Notes

1. **User Points Storage**: Currently using in-memory storage. Replace with database in production.
2. **Verification**: Currently returns `true` for all verifications. Implement actual API calls to:
   - Twitter API for follow verification
   - Discord API for server membership verification
   - Telegram API for channel membership verification
3. **Rate Limiting**: All endpoints are rate-limited to prevent abuse.
4. **No Authentication**: APIs are public and require `userId` in request body.

## Environment Variables Needed

For actual verification implementation, you'll need:

```env
# Twitter API
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Discord API
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_discord_server_id

# Telegram API
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHANNEL_ID=your_telegram_channel_id
``` 