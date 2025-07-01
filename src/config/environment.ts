import dotenv from 'dotenv'
import { User } from '@/models'

dotenv.config()

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000'),
  HOST: process.env.HOST || 'localhost',

  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://admin:NJIWthnO7WAI0o6u@cluster0.ttvvz.mongodb.net/beatwise',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'beatwise',

  // External APIs
  WALLET_CONNECT_PROJECT_ID: process.env.WALLET_CONNECT_PROJECT_ID || 'your_wallet_connect_project_id',
  THIRD_PARTY_API_KEY: process.env.THIRD_PARTY_API_KEY || 'your_third_party_api_key',
} as const

export default config