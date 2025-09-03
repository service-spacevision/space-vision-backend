import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { StarlinkUsageController } from '../../app/controllers/starlinkUsageControllers/starlinkUsageController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreateStarlinkUsageSchema, UpdateStarlinkUsageSchema } from '../../app/models/StarlinkUsage'

const permission = {
  "GET_/api/starlink-usage": "read_starlink_usage",
  "POST_/api/starlink-usage": "create_starlink_usage",
  "PUT_/api/starlink-usage": "update_starlink_usage",
  "DELETE_/api/starlink-usage": "delete_starlink_usage",
  "POST_/api/starlink-usage/sync": "sync_starlink_usage",
  "GET_/api/starlink-usage/date-range": "read_starlink_usage"
}

const starlinkUsageRoute = new Elysia({ prefix: '/api/starlink-usage' })
  .use(cookie())
  .get('/', StarlinkUsageController.getStarlinkUsage, {
    beforeHandle: [checkUser(permission["GET_/api/starlink-usage"])],
    query: t.Object({
      dateKey: t.Optional(t.String({
        description: 'Filter by date key'
      })),
      kitNumber: t.Optional(t.String({
        description: 'Filter by kit number'
      })),
      vesselName: t.Optional(t.String({
        description: 'Filter by vessel name'
      })),
      currentPage: t.Optional(t.String({
        description: 'Current Page number',
        default: "1"
      })),
      pageSize: t.Optional(t.String({
        description: 'Number of items per page',
        default: "10"
      })),
      all: t.Optional(t.String({
        description: 'Retrieve all starlink usage (true/false)',
        default: "false"
      }))
    }),
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Get starlink usage',
      description: 'Retrieve starlink usage with optional filtering',
      operationId: 'getStarlinkUsage',
    },
  })

  .post('/', StarlinkUsageController.createStarlinkUsage, {
    beforeHandle: [checkUser(permission["POST_/api/starlink-usage"])],
    body: CreateStarlinkUsageSchema,
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Create starlink usage',
      description: 'Create a new starlink usage record',
      operationId: 'createStarlinkUsage',
    }
  })

  .put('/', StarlinkUsageController.updateStarlinkUsage, {
    beforeHandle: [checkUser(permission["PUT_/api/starlink-usage"])],
    query: t.Object({
      dateKey: t.String({
        description: 'Date key to update'
      }),
      kitNumber: t.String({
        description: 'Kit number to update'
      })
    }),
    body: UpdateStarlinkUsageSchema,
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Update starlink usage',
      description: 'Update an existing starlink usage record',
      operationId: 'updateStarlinkUsage',
    }
  })

  .delete('/', StarlinkUsageController.deleteStarlinkUsage, {
    beforeHandle: [checkUser(permission["DELETE_/api/starlink-usage"])],
    query: t.Object({
      dateKey: t.String({
        description: 'Date key to delete'
      }),
      kitNumber: t.String({
        description: 'Kit number to delete'
      })
    }),
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Delete starlink usage',
      description: 'Delete an existing starlink usage record',
      operationId: 'deleteStarlinkUsage',
    }
  })

  .post('/sync', StarlinkUsageController.syncStarlinkUsage, {
    beforeHandle: [checkUser(permission["POST_/api/starlink-usage/sync"])],
    query: t.Object({
      datekey: t.Optional(t.String({
        description: 'Optional date key to sync specific date (format: YYYYMMDD)',
        example: '20250810'
      }))
    }),
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Sync starlink usage data',
      description: 'Fetch and synchronize starlink usage data from external API. If datekey is provided, syncs data for that specific date, otherwise syncs latest data.',
      operationId: 'syncStarlinkUsage',
    }
  })

  .get('/date-range', StarlinkUsageController.getStarlinkUsageByDateRange, {
    beforeHandle: [checkUser(permission["GET_/api/starlink-usage/date-range"])],
    query: t.Object({
      startDate: t.String({
        description: 'Start date for the range (format: YYYYMMDD)',
        example: '20250801'
      }),
      endDate: t.String({
        description: 'End date for the range (format: YYYYMMDD)',
        example: '20250831'
      })
    }),
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Get starlink usage data by date range',
      description: 'Retrieve starlink usage data within a specified date range with populated vessel and vessel group information. Returns detailed usage statistics and vessel details.',
      operationId: 'getStarlinkUsageByDateRange',
    }
  })

export default starlinkUsageRoute