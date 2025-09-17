import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { BluetideUsageController } from '../../app/controllers/bluetideUsageControllers/bluetideUsageController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreateBluetideUsageSchema, UpdateBluetideUsageSchema } from '../../app/models/BluetideUsage'

const permission = {
  "GET_/api/bluetide-usage": "read_bluetide_usage",
  "POST_/api/bluetide-usage": "create_bluetide_usage",
  "PUT_/api/bluetide-usage": "update_bluetide_usage",
  "DELETE_/api/bluetide-usage": "delete_bluetide_usage",
  "GET_/api/bluetide-usage/sync-telemetry": "sync_bluetide_telemetry"
}

const bluetideUsageRoute = new Elysia({ prefix: '/api/bluetide-usage' })
  .use(cookie())
  .get('/', BluetideUsageController.getBluetideUsage, {
    beforeHandle: [checkUser(permission["GET_/api/bluetide-usage"])],
    query: t.Object({
      date: t.Optional(t.String({
        description: 'Filter by date'
      })),
      kitp: t.Optional(t.String({
        description: 'Filter by KITP'
      })),
      name: t.Optional(t.String({
        description: 'Filter by name'
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
        description: 'Retrieve all bluetide usage (true/false)',
        default: "false"
      }))
    }),
    tags: ['Bluetide Usage'],
    detail: {
      summary: 'Get bluetide usage',
      description: 'Retrieve bluetide usage with optional filtering',
      operationId: 'getBluetideUsage',
    },
  })

  .post('/', BluetideUsageController.createBluetideUsage, {
    beforeHandle: [checkUser(permission["POST_/api/bluetide-usage"])],
    body: CreateBluetideUsageSchema,
    tags: ['Bluetide Usage'],
    detail: {
      summary: 'Create bluetide usage',
      description: 'Create a new bluetide usage record',
      operationId: 'createBluetideUsage',
    }
  })

  .put('/', BluetideUsageController.updateBluetideUsage, {
    beforeHandle: [checkUser(permission["PUT_/api/bluetide-usage"])],
    query: t.Object({
      date: t.String({
        description: 'Date to update'
      }),
      kitp: t.String({
        description: 'KITP to update'
      })
    }),
    body: UpdateBluetideUsageSchema,
    tags: ['Bluetide Usage'],
    detail: {
      summary: 'Update bluetide usage',
      description: 'Update an existing bluetide usage record',
      operationId: 'updateBluetideUsage',
    }
  })

  .delete('/', BluetideUsageController.deleteBluetideUsage, {
    beforeHandle: [checkUser(permission["DELETE_/api/bluetide-usage"])],
    query: t.Object({
      date: t.String({
        description: 'Date to delete'
      }),
      kitp: t.String({
        description: 'KITP to delete'
      })
    }),
    tags: ['Bluetide Usage'],
    detail: {
      summary: 'Delete bluetide usage',
      description: 'Delete an existing bluetide usage record',
      operationId: 'deleteBluetideUsage',
    }
  })

  .get('/sync-telemetry', BluetideUsageController.syncBluetideTelemetry, {
    beforeHandle: [checkUser(permission["GET_/api/bluetide-usage/sync-telemetry"])],
    query: t.Object({
      deviceId: t.Optional(t.String({ description: 'Optional deviceId to sync only a single device' })),
      maxPages: t.Optional(t.String({ description: 'Optional limit of pages to process this run' })),
    }),
    tags: ['Bluetide Usage'],
    detail: {
      summary: 'Sync bluetide telemetry',
      description: 'Sync bluetide telemetry data. Optionally scope by deviceId.',
      operationId: 'syncBluetideTelemetry',
    }
  })

export { permission }
export default bluetideUsageRoute
