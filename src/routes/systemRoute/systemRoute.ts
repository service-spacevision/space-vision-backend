import { Elysia, t } from 'elysia'
import { APP_CONFIG } from '../../app/constants/constants'
import { db } from '../../app/db/connection'

const systemRoute = new Elysia({ prefix: '/api/system' })
  .get('/health', async () => {
    try {
      // Test database connection
      await db.execute('SELECT 1')
      
      return {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'healthy',
          api: 'healthy'
        }
      }
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'unhealthy',
          api: 'healthy'
        },
        error: 'Database connection failed'
      }
    }
  }, {
    response: {
      200: t.Object({
        success: t.Boolean(),
        status: t.String(),
        timestamp: t.String(),
        services: t.Object({
          database: t.String(),
          api: t.String()
        }),
        error: t.Optional(t.String())
      })
    },
    tags: ['System'],
    summary: 'Health check',
    description: 'Check system health status'
  })
  
  .get('/status', () => {
    return {
      success: true,
      name: APP_CONFIG.NAME,
      version: APP_CONFIG.VERSION,
      environment: APP_CONFIG.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  }, {
    response: {
      200: t.Object({
        success: t.Boolean(),
        name: t.String(),
        version: t.String(),
        environment: t.String(),
        uptime: t.Number(),
        timestamp: t.String()
      })
    },
    tags: ['System'],
    summary: 'System status',
    description: 'Get system status information'
  })
  
  .get('/version', () => {
    return {
      success: true,
      version: APP_CONFIG.VERSION,
      name: APP_CONFIG.NAME
    }
  }, {
    response: {
      200: t.Object({
        success: t.Boolean(),
        version: t.String(),
        name: t.String()
      })
    },
    tags: ['System'],
    summary: 'API version',
    description: 'Get API version information'
  })

export default systemRoute