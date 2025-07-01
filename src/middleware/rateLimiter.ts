import rateLimit from 'express-rate-limit'
import { config } from '@/config/environment'

// General rate limiter - more permissive for polling
export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 120, // 120 requests per minute (2 requests per second)
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 1, // 1 minute
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests
  skipFailedRequests: false, // Count all requests
})

// API rate limiter - for general API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2000 requests per 15 minutes (about 2.2 requests per second)
  message: {
    error: 'API rate limit exceeded',
    retryAfter: 15,
  },
})

// Profile-specific rate limiter - more permissive for user profile polling
export const profileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 200, // 200 requests per minute (about 3.3 requests per second)
  message: {
    error: 'Profile rate limit exceeded, please reduce polling frequency',
    retryAfter: 1,
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict rate limiter - for sensitive operations
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes
  message: {
    error: 'Too many requests for this operation, please try again later.',
    retryAfter: 15,
  },
})