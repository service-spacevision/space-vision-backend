import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

export const corsMiddleware = new Elysia()
  .use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? [
          'https://yourdomain.com',
          'http://45.8.133.216:3000',
          'http://localhost:3000',
          'http://127.0.0.1:3000'
        ]
      : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  }))