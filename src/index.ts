import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cookie } from '@elysiajs/cookie'
import { APP_CONFIG } from './app/constants/constants'
import { connectDatabase } from './app/db/connection'
import { corsMiddleware } from './app/middlewares/cors'
// import { loggingMiddleware } from './app/middlewares/logging'
import { authRoutes, userRoutes, userRoleRoutes, systemRoutes } from './routes/indexRoute'

const app = new Elysia()
  .use(cookie())
  .use(swagger({
    documentation: {
      info: {
        title: APP_CONFIG.NAME,
        version: APP_CONFIG.VERSION,
        description: APP_CONFIG.DESCRIPTION
      },
      tags: [
        { name: 'Authentication', description: 'Authentication endpoints' },
        { name: 'User', description: 'User management endpoints' },
        { name: 'UserRole', description: 'User role management endpoints' },
        { name: 'System', description: 'System health and status endpoints' }
      ],
      servers: [
        {
          url: process.env.NODE_ENV === 'production' 
            ? 'https://your-domain.com' 
            : `http://localhost:${APP_CONFIG.PORT}`,
          description: process.env.NODE_ENV === 'production' 
            ? 'Production server' 
            : 'Development server'
        }
      ]
    }
  }))
  .use(corsMiddleware)
  // .use(loggingMiddleware)
  .get('/', () => ({
    success: true,
    message: `Welcome to ${APP_CONFIG.NAME}`,
    version: APP_CONFIG.VERSION,
    documentation: '/swagger',
    endpoints: {
      health: '/api/system/health',
      status: '/api/system/status',
      auth: '/api/auth',
      users: '/api/users',
      userRoles: '/api/user-roles'
    }
  }))
  .use(authRoutes)
  .use(userRoutes)
  .use(userRoleRoutes)
  .use(systemRoutes)
  .onError(({ error, code, set }) => {
    console.error('Application error:', error)
    
    if (code === 'NOT_FOUND') {
      set.status = 404
      return { 
        success: false,
        error: 'Route not found', 
        status: 404 
      }
    }
    
    if (code === 'VALIDATION') {
      set.status = 400
      return { 
        success: false,
        error: 'Validation error', 
        message: error.message,
        status: 400 
      }
    }
    
    set.status = 500
    return { 
      success: false,
      error: 'Internal server error', 
      status: 500 
    }
  })
  .listen(APP_CONFIG.PORT)

// Initialize database connection
connectDatabase().catch((error) => {
  console.error('Failed to connect to database:', error)
  process.exit(1)
})

console.log(`🦊 ${APP_CONFIG.NAME} is running at http://${app.server?.hostname}:${app.server?.port}`)
console.log(`📚 API Documentation available at http://${app.server?.hostname}:${app.server?.port}/swagger`)
console.log(`🏥 Health check available at http://${app.server?.hostname}:${app.server?.port}/api/system/health`)