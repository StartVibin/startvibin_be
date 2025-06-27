import cors from 'cors'
import { config } from '@/config/environment'

const corsOptions: cors.CorsOptions = {
  // origin: function (origin, callback) {
  //   // Allow requests with no origin (like mobile apps or curl requests)
  //   if (!origin) return callback(null, true)
    
  //   if (config.ALLOWED_ORIGINS.includes(origin)) {
  //     callback(null, true)
  //   } else {
  //     callback(new Error('Not allowed by CORS'))
  //   }
  // },
  origin: true,
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
}

export const corsMiddleware = cors(corsOptions)