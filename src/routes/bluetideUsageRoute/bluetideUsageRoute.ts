import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { BluetideUsageController } from '../../app/controllers/bluetideUsageControllers/bluetideUsageController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreateBluetideUsageSchema, UpdateBluetideUsageSchema } from '../../app/models/BluetideUsage'

const permission = {
  "GET_/api/bluetide-usage": "read_bluetide_usage",
  "POST_/api/bluetide-usage": "create_bluetide_usage",
  "PUT_/api/bluetide-usage": "update_bluetide_usage",
  "DELETE_/api/bluetide-usage": "delete_bluetide_usage"
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

export default bluetideUsageRoute