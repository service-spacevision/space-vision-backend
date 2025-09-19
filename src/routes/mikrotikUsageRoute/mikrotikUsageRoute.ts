import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { MikrotikUsageController } from '../../app/controllers/mikrotikUsageControllers/mikrotikUsageController'
import { checkUser } from '../../app/middlewares/permissions'

const permission = {
  "GET_/api/mikrotik-usage": "read_mikrotik_usage",
  "POST_/api/mikrotik-usage/sync": "sync_mikrotik_usage"
}

const mikrotikUsageRoute = new Elysia({ prefix: '/api/mikrotik-usage' })
  .use(cookie())
  
  // Get usage data
  .get('/', MikrotikUsageController.getMikrotikUsage, {
    beforeHandle: [checkUser(permission["GET_/api/mikrotik-usage"])],
    query: t.Object({
      vesselName: t.Optional(t.String({
        description: 'Filter by vessel name'
      })),
      username: t.Optional(t.String({
        description: 'Filter by username'
      })),
      currentPage: t.Optional(t.String({
        description: 'Current page number',
        default: '1'
      })),
      pageSize: t.Optional(t.String({
        description: 'Number of items per page',
        default: '10'
      }))
    }),
    detail: {
      tags: ['Mikrotik Usage'],
      description: 'Get Mikrotik usage data with pagination and filtering',
      security: [{ bearerAuth: [] }]
    }
  })
  
  // Trigger sync with Mikrotik routers
  .post('/sync', MikrotikUsageController.syncMikrotikUsage, {
    beforeHandle: [checkUser(permission["POST_/api/mikrotik-usage/sync"])],
    detail: {
      tags: ['Mikrotik Usage'],
      description: 'Trigger a sync with all Mikrotik routers to update usage data',
      security: [{ bearerAuth: [] }]
    }
  })

export { permission }
export default mikrotikUsageRoute
