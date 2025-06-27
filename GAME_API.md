# Game API Documentation

This API handles game points accumulation and high score tracking for users.

## Base URL
```
http://localhost:5000/api/v1/game
```

## Endpoints

### 1. Add Game Points
**POST** `/points`

Add game points to a user's account and update their high score if the new score is higher.

**Request Body:**
```json
{
  "walletAddress": "0x1234567890abcdef...",
  "gamePoints": 1500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Game points added successfully",
  "data": {
    "walletAddress": "0x1234567890abcdef...",
    "pointsAdded": 1500,
    "previousGamePoints": 500,
    "currentGamePoints": 2000,
    "totalPoints": 2500,
    "highScore": 1500,
    "isNewHighScore": true,
    "previousHighScore": 1200
  }
}
```

**Error Responses:**
- `400` - Missing wallet address or invalid game points
- `404` - User not found

### 2. Get User Game Statistics
**GET** `/stats/:walletAddress`

Get a user's game statistics including points and high score.

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x1234567890abcdef...",
    "gamePoints": 2000,
    "highScore": 1500,
    "totalPoints": 2500,
    "socialPoints": 300,
    "referralPoints": 200
  }
}
```

**Error Responses:**
- `400` - Missing wallet address
- `404` - User not found

### 3. Get Top Players
**GET** `/top?limit=10&page=1`

Get top players sorted by high score.

**Query Parameters:**
- `limit` (optional): Number of players to return (default: 10, max: 50)
- `page` (optional): Page number for pagination (default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "players": [
      {
        "walletAddress": "0x1234567890abcdef...",
        "highScore": 5000,
        "gamePoints": 3000,
        "totalPoints": 3500,
        "rank": 1
      },
      {
        "walletAddress": "0xabcdef1234567890...",
        "highScore": 4500,
        "gamePoints": 2500,
        "totalPoints": 3000,
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

### 4. Get User Rank
**GET** `/rank/:walletAddress`

Get a user's rank based on their high score.

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x1234567890abcdef...",
    "highScore": 1500,
    "gamePoints": 2000,
    "totalPoints": 2500,
    "rank": 5,
    "totalPlayers": 150
  }
}
```

**Error Responses:**
- `400` - Missing wallet address
- `404` - User not found

### 5. Reset Game Points (Admin)
**DELETE** `/reset/:walletAddress`

Reset a user's game points to 0 (keeps high score).

**Response:**
```json
{
  "success": true,
  "message": "Game points reset successfully",
  "data": {
    "walletAddress": "0x1234567890abcdef...",
    "previousGamePoints": 2000,
    "currentGamePoints": 0,
    "highScore": 1500,
    "totalPoints": 500
  }
}
```

**Error Responses:**
- `400` - Missing wallet address
- `404` - User not found

## Usage Examples

### Using cURL

**Add Game Points:**
```bash
curl -X POST http://localhost:5000/api/v1/game/points \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890abcdef...",
    "gamePoints": 1500
  }'
```

**Get User Stats:**
```bash
curl -X GET http://localhost:5000/api/v1/game/stats/0x1234567890abcdef...
```

**Get Top Players:**
```bash
curl -X GET "http://localhost:5000/api/v1/game/top?limit=5&page=1"
```

**Get User Rank:**
```bash
curl -X GET http://localhost:5000/api/v1/game/rank/0x1234567890abcdef...
```

### Using JavaScript/Fetch

**Add Game Points:**
```javascript
const response = await fetch('http://localhost:5000/api/v1/game/points', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    walletAddress: '0x1234567890abcdef...',
    gamePoints: 1500
  })
})

const data = await response.json()
console.log(data)
```

**Get Top Players:**
```javascript
const response = await fetch('http://localhost:5000/api/v1/game/top?limit=10&page=1')
const data = await response.json()
console.log(data.data.players)
```

## Notes

- Game points are accumulated (added to existing points)
- High score is updated only when the new game points exceed the current high score
- High score represents the highest single game score achieved
- Game points represent the total accumulated points from all games
- The API automatically handles user authentication via wallet address
- All wallet addresses are stored in lowercase for consistency 