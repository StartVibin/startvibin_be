# Leaderboard API

This API provides leaderboard functionality for the BeatWise platform, showing user rankings based on different point types.

## Endpoints

### 1. Get Top Users (Default)

**GET** `/api/v1/leaderboard`

Get top users by total points (default top 10).

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 10, max: 100)
- `page` (optional): Page number for pagination (default: 1)

**Example Request:**
```bash
GET /api/v1/leaderboard
GET /api/v1/leaderboard?limit=20&page=2
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "walletAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
        "totalPoints": 1250,
        "gamePoints": 500,
        "referralPoints": 300,
        "socialPoints": 450,
        "rank": 1
      },
      {
        "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
        "totalPoints": 980,
        "gamePoints": 400,
        "referralPoints": 200,
        "socialPoints": 380,
        "rank": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}
```

### 2. Get User's Rank

**GET** `/api/v1/leaderboard/rank/:walletAddress`

Get a specific user's rank and point information.

**Path Parameters:**
- `walletAddress` (required): The user's wallet address

**Example Request:**
```bash
GET /api/v1/leaderboard/rank/0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
    "totalPoints": 1250,
    "gamePoints": 500,
    "referralPoints": 300,
    "socialPoints": 450,
    "rank": 1,
    "totalUsers": 150
  }
}
```

### 3. Get Leaderboard by Point Type

**GET** `/api/v1/leaderboard/:type`

Get leaderboard sorted by specific point type.

**Path Parameters:**
- `type` (required): Point type to sort by (`game`, `referral`, `social`, `total`)

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 10, max: 100)
- `page` (optional): Page number for pagination (default: 1)

**Example Requests:**
```bash
# Game points leaderboard
GET /api/v1/leaderboard/game

# Referral points leaderboard
GET /api/v1/leaderboard/referral

# Social points leaderboard
GET /api/v1/leaderboard/social

# Total points leaderboard (same as default)
GET /api/v1/leaderboard/total

# With pagination
GET /api/v1/leaderboard/game?limit=20&page=2
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "type": "game",
    "users": [
      {
        "walletAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
        "gamePoints": 500,
        "totalPoints": 1250,
        "rank": 1
      },
      {
        "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
        "gamePoints": 400,
        "totalPoints": 980,
        "rank": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}
```

## Point Types

The leaderboard supports four different point types:

- **`game`**: Points earned from completing game quests and challenges
- **`referral`**: Points earned through the referral system
- **`social`**: Points earned from social media quests (Twitter, Discord, Telegram)
- **`total`**: Sum of all three point types (calculated automatically)

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid point type. Use: game, referral, social, or total"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

## Usage Examples

### JavaScript/Fetch Examples

**Get top 10 users:**
```javascript
const response = await fetch('http://localhost:5000/api/v1/leaderboard');
const data = await response.json();
console.log('Top users:', data.data.users);
```

**Get user's rank:**
```javascript
const walletAddress = '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6';
const response = await fetch(`http://localhost:5000/api/v1/leaderboard/rank/${walletAddress}`);
const data = await response.json();
console.log(`User rank: ${data.data.rank}/${data.data.totalUsers}`);
```

**Get game points leaderboard:**
```javascript
const response = await fetch('http://localhost:5000/api/v1/leaderboard/game?limit=20');
const data = await response.json();
console.log('Game points leaderboard:', data.data.users);
```

### cURL Examples

**Get top 10 users:**
```bash
curl http://localhost:5000/api/v1/leaderboard
```

**Get user's rank:**
```bash
curl http://localhost:5000/api/v1/leaderboard/rank/0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6
```

**Get social points leaderboard:**
```bash
curl "http://localhost:5000/api/v1/leaderboard/social?limit=5"
```

## Features

- **Pagination**: Support for large datasets with page and limit parameters
- **Multiple Rankings**: Rank by game, referral, social, or total points
- **User Ranking**: Find specific user's rank in the leaderboard
- **Efficient Queries**: Uses MongoDB aggregation for optimal performance
- **Real-time Data**: Always shows current point totals and rankings 