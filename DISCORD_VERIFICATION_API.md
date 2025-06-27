# Discord Verification API

This API provides Discord server membership verification for the BeatWise platform.

## Prerequisites

### 1. Discord Bot Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Add the bot to your server with these permissions:
   - `guilds.members.read` - To read server members
   - `guilds` - To access server information

### 2. Environment Variables
Add these to your `.env` file:
```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id_here
```

### 3. Get Server ID
1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on your server name
3. Click "Copy Server ID"

### 4. Get User's Discord ID
1. Enable Developer Mode in Discord
2. Right-click on the user's name
3. Click "Copy User ID"

## Endpoints

### 1. Verify Discord Membership

**POST** `/api/v1/discord/verify`

Verify if a user is a member of the Discord server.

**Request Body:**
```json
{
  "discordUserId": "123456789012345678",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Discord membership verified successfully",
  "data": {
    "isMember": true,
    "discordUserId": "123456789012345678",
    "member": {
      "user": {
        "id": "123456789012345678",
        "username": "username",
        "discriminator": "1234",
        "avatar": "avatar_hash"
      },
      "roles": ["role1", "role2"],
      "joined_at": "2023-01-01T00:00:00.000Z",
      "permissions": "permission_string"
    },
    "guild": {
      "id": "guild_id",
      "name": "Server Name",
      "icon": "icon_hash",
      "owner": false,
      "permissions": "permission_string",
      "features": ["feature1", "feature2"]
    }
  }
}
```

### 2. Get Discord Server Information

**GET** `/api/v1/discord/server`

Get information about the Discord server.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "server": {
      "id": "guild_id",
      "name": "BeatWise Community",
      "icon": "icon_hash",
      "owner": false,
      "permissions": "permission_string",
      "features": ["feature1", "feature2"]
    },
    "memberCount": 1500
  }
}
```

### 3. Get User's Discord Roles

**GET** `/api/v1/discord/roles/:discordUserId`

Get all roles for a specific Discord user.

**Example Request:**
```bash
GET /api/v1/discord/roles/123456789012345678
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "discordUserId": "123456789012345678",
    "roles": ["role1", "role2", "role3"],
    "member": {
      "user": {
        "id": "123456789012345678",
        "username": "username",
        "discriminator": "1234",
        "avatar": "avatar_hash"
      },
      "roles": ["role1", "role2", "role3"],
      "joined_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Check User's Specific Role

**GET** `/api/v1/discord/role/:discordUserId/:roleId`

Check if a user has a specific Discord role.

**Example Request:**
```bash
GET /api/v1/discord/role/123456789012345678/987654321098765432
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "discordUserId": "123456789012345678",
    "roleId": "987654321098765432",
    "hasRole": true
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Discord user ID is required"
}
```

### 400 Bad Request (Not a member)
```json
{
  "success": false,
  "message": "User is not a member of the Discord server"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Discord bot not configured"
}
```

## Usage Examples

### JavaScript/Fetch Examples

**Verify Discord membership:**
```javascript
const response = await fetch('http://localhost:5000/api/v1/discord/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    discordUserId: '123456789012345678',
    userId: '507f1f77bcf86cd799439011'
  })
});

const data = await response.json();
console.log('Is member:', data.data.isMember);
```

**Get server info:**
```javascript
const response = await fetch('http://localhost:5000/api/v1/discord/server');
const data = await response.json();
console.log('Server name:', data.data.server.name);
console.log('Member count:', data.data.memberCount);
```

**Check user role:**
```javascript
const discordUserId = '123456789012345678';
const roleId = '987654321098765432';
const response = await fetch(`http://localhost:5000/api/v1/discord/role/${discordUserId}/${roleId}`);
const data = await response.json();
console.log('Has role:', data.data.hasRole);
```

### cURL Examples

**Verify Discord membership:**
```bash
curl -X POST "http://localhost:5000/api/v1/discord/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "discordUserId": "123456789012345678",
    "userId": "507f1f77bcf86cd799439011"
  }'
```

**Get server info:**
```bash
curl http://localhost:5000/api/v1/discord/server
```

**Get user roles:**
```bash
curl http://localhost:5000/api/v1/discord/roles/123456789012345678
```

## Integration with Quest System

The Discord verification is automatically integrated with the quest system. When a user completes a Discord quest, the system will:

1. Verify the user is a member of the Discord server
2. Award social points if verification passes
3. Store the Discord user ID in the user's profile
4. Mark the user as having joined Discord

## Security Features

- **Bot Token Security**: Bot token is stored in environment variables
- **Permission Checks**: Bot only has necessary permissions
- **Error Handling**: Comprehensive error handling for API failures
- **Logging**: Detailed logging for debugging and monitoring
- **Rate Limiting**: Respects Discord API rate limits

## Rate Limits

Discord API has rate limits:
- 50 requests per second per bot
- 1000 requests per 10 minutes per bot

The service includes proper error handling for rate limit responses. 