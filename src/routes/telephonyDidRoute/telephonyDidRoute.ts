import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { TelephonyDidController } from '../../app/controllers/telephonyDidControllers/telephonyDidController'
import { checkUser } from '../../app/middlewares/permissions'
import { CreateTelephonyDidSchema, UpdateTelephonyDidSchema } from '../../app/models/TelephonyDid'

const permission = {
  "GET_/api/telephony-dids": "read_telephony_dids",
  "POST_/api/telephony-dids": "create_telephony_did",
  "PUT_/api/telephony-dids": "update_telephony_did",
  "DELETE_/api/telephony-dids": "delete_telephony_did"
}

const telephonyDidRoute = new Elysia({ prefix: '/api/telephony-dids' })
  .use(cookie())
  .get('/', TelephonyDidController.getTelephonyDids, {
    beforeHandle: [checkUser(permission["GET_/api/telephony-dids"])],
    query: t.Object({
      number: t.Optional(t.String({
        description: 'Filter by phone number'
      })),
      blocked: t.Optional(t.Boolean({
        description: 'Filter by blocked status'
      })),
      terminated: t.Optional(t.Boolean({
        description: 'Filter by terminated status'
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
        description: 'Retrieve all telephony DIDs (true/false)',
        default: "false"
      }))
    }),
    tags: ['Telephony DIDs'],
    detail: {
      summary: 'Get telephony DIDs',
      description: 'Retrieve telephony DIDs with optional filtering',
      operationId: 'getTelephonyDids',
    },
  })

  .post('/', TelephonyDidController.createTelephonyDid, {
    beforeHandle: [checkUser(permission["POST_/api/telephony-dids"])],
    body: CreateTelephonyDidSchema,
    tags: ['Telephony DIDs'],
    detail: {
      summary: 'Create telephony DID',
      description: 'Create a new telephony DID',
      operationId: 'createTelephonyDid',
    }
  })

  .put('/', TelephonyDidController.updateTelephonyDid, {
    beforeHandle: [checkUser(permission["PUT_/api/telephony-dids"])],
    query: t.Object({
      number: t.String({
        description: 'Phone number to update'
      })
    }),
    body: UpdateTelephonyDidSchema,
    tags: ['Telephony DIDs'],
    detail: {
      summary: 'Update telephony DID',
      description: 'Update an existing telephony DID',
      operationId: 'updateTelephonyDid',
    }
  })

  .delete('/', TelephonyDidController.deleteTelephonyDid, {
    beforeHandle: [checkUser(permission["DELETE_/api/telephony-dids"])],
    query: t.Object({
      number: t.String({
        description: 'Phone number to delete'
      })
    }),
    tags: ['Telephony DIDs'],
    detail: {
      summary: 'Delete telephony DID',
      description: 'Delete an existing telephony DID',
      operationId: 'deleteTelephonyDid',
    }
  })

export default telephonyDidRoute