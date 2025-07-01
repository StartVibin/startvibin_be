# Rate Limiting Strategy

## Overview
This document explains the rate limiting configuration implemented to handle frontend polling while protecting against abuse.

## Problem Solved
- **Issue**: Frontend was polling user profile data every 3 seconds (20 requests/minute)
- **Previous Limit**: 100 requests per 15 minutes (6.7 requests/minute)
- **Result**: Frequent 429 (Too Many Requests) errors

## New Rate Limiting Configuration

### 1. General Limiter (Applied globally)
- **Window**: 1 minute
- **Limit**: 120 requests per minute (2 requests per second)
- **Purpose**: Basic protection for all endpoints
- **Applied to**: All routes via `app.use(generalLimiter)`

### 2. Profile Limiter (User profile endpoints)
- **Window**: 1 minute
- **Limit**: 200 requests per minute (3.3 requests per second)
- **Purpose**: Allow frequent polling of user profile data
- **Applied to**: `/auth/profile/:walletAddress`

### 3. API Limiter (General API endpoints)
- **Window**: 15 minutes
- **Limit**: 2000 requests per 15 minutes (2.2 requests per second)
- **Purpose**: Higher limits for general API usage
- **Applied to**: Can be applied to specific route groups

### 4. Strict Limiter (Sensitive operations)
- **Window**: 15 minutes
- **Limit**: 50 requests per 15 minutes
- **Purpose**: Protect sensitive operations like authentication
- **Applied to**: `/auth/message`, `/auth/wallet`

## Frontend Recommendations

### Optimal Polling Strategy
```javascript
// Recommended: Poll every 5-10 seconds instead of 3 seconds
const POLLING_INTERVAL = 5000; // 5 seconds

setInterval(() => {
  fetchUserProfile();
}, POLLING_INTERVAL);
```

### Exponential Backoff on 429 Errors
```javascript
const fetchWithRetry = async (url, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

### WebSocket Alternative
Consider implementing WebSocket connections for real-time updates instead of polling:
- Reduces server load
- Provides instant updates
- Better user experience

## Monitoring and Adjustments

### Current Limits Analysis
- **3-second polling**: 20 requests/minute ✅ (within 200 limit)
- **5-second polling**: 12 requests/minute ✅ (well within limits)
- **10-second polling**: 6 requests/minute ✅ (very safe)

### Monitoring Headers
The API returns rate limit information in response headers:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Time when the limit resets

### Adjusting Limits
To modify limits, edit the values in `src/middleware/rateLimiter.ts`:

```typescript
// For more permissive profile polling
export const profileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // Increase to 300 requests per minute
  // ... other options
});
```

## Security Considerations

1. **IP-based limiting**: All limits are per IP address
2. **Trust proxy**: Configured to work behind load balancers
3. **Differentiated limits**: Sensitive operations have stricter limits
4. **Graceful degradation**: 429 responses include retry information

## Testing Rate Limits

You can test the rate limits using curl:

```bash
# Test profile endpoint (200 requests per minute)
for i in {1..25}; do
  curl -X GET "http://localhost:5000/api/v1/auth/profile/test-address"
  sleep 0.1
done

# Test strict endpoint (50 requests per 15 minutes)
for i in {1..10}; do
  curl -X GET "http://localhost:5000/api/v1/auth/message"
  sleep 0.1
done
``` 