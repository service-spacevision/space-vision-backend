import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { StarlinkUsageController } from '../../app/controllers/starlinkUsageControllers/starlinkUsageController';
import { checkUser } from '../../app/middlewares/permissions';
import {
  CreateStarlinkUsageSchema,
  UpdateStarlinkUsageSchema,
} from '../../app/models/StarlinkUsage';

const permission = {
  'GET_/api/starlink-usage': 'read_starlink_usage',
  'POST_/api/starlink-usage': 'create_starlink_usage',
  'PUT_/api/starlink-usage': 'update_starlink_usage',
  'DELETE_/api/starlink-usage': 'delete_starlink_usage',
  'POST_/api/starlink-usage/sync': 'sync_starlink_usage',
  'POST_/api/starlink-usage/sync-by-range': 'sync_starlink_usage',
  'GET_/api/starlink-usage/date-range': 'read_starlink_usage',
  'GET_/api/starlink-usage/stats': 'read_starlink_usage',
  'GET_/api/starlink-usage/system-summary': 'read_starlink_usage',
  'GET_/api/starlink-usage/top-usage': 'read_starlink_usage',
  'GET_/api/starlink-usage/trends': 'read_starlink_usage',
  'GET_/api/starlink-usage/kit-data': 'read_starlink_usage',
  'GET_/api/starlink-usage/analytics': 'read_starlink_usage',
};

const starlinkUsageRoute = new Elysia({ prefix: '/api/starlink-usage' })
  .use(cookie())
  .get('/', StarlinkUsageController.getStarlinkUsage, {
    beforeHandle: [checkUser(permission['GET_/api/starlink-usage'])],
    query: t.Object({
      dateKey: t.Optional(
        t.String({
          description: 'Filter by date key',
        })
      ),
      startDate: t.Optional(
        t.String({
          description: 'Filter by start date',
        })
      ),
      endDate: t.Optional(
        t.String({
          description: 'Filter by end date',
        })
      ),
      kitNumber: t.Optional(
        t.String({
          description: 'Filter by kit number',
        })
      ),
      vesselName: t.Optional(
        t.String({
          description: 'Filter by vessel name',
        })
      ),
      currentPage: t.Optional(
        t.String({
          description: 'Current Page number',
          default: '1',
        })
      ),
      pageSize: t.Optional(
        t.String({
          description: 'Number of items per page',
          default: '10',
        })
      ),
      all: t.Optional(
        t.String({
          description: 'Retrieve all starlink usage (true/false)',
          default: 'false',
        })
      ),
    }),
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Get starlink usage',
      description: 'Retrieve starlink usage with optional filtering',
      operationId: 'getStarlinkUsage',
    },
  })

  .post('/', StarlinkUsageController.createStarlinkUsage, {
    beforeHandle: [checkUser(permission['POST_/api/starlink-usage'])],
    body: CreateStarlinkUsageSchema,
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Create starlink usage',
      description: 'Create a new starlink usage record',
      operationId: 'createStarlinkUsage',
    },
  })

  .put('/', StarlinkUsageController.updateStarlinkUsage, {
    beforeHandle: [checkUser(permission['PUT_/api/starlink-usage'])],
    query: t.Object({
      dateKey: t.String({
        description: 'Date key to update',
      }),
      kitNumber: t.String({
        description: 'Kit number to update',
      }),
    }),
    body: UpdateStarlinkUsageSchema,
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Update starlink usage',
      description: 'Update an existing starlink usage record',
      operationId: 'updateStarlinkUsage',
    },
  })

  .delete('/', StarlinkUsageController.deleteStarlinkUsage, {
    beforeHandle: [checkUser(permission['DELETE_/api/starlink-usage'])],
    query: t.Object({
      dateKey: t.String({
        description: 'Date key to delete',
      }),
      kitNumber: t.String({
        description: 'Kit number to delete',
      }),
    }),
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Delete starlink usage',
      description: 'Delete an existing starlink usage record',
      operationId: 'deleteStarlinkUsage',
    },
  })

  .post('/sync', StarlinkUsageController.syncStarlinkUsage, {
    beforeHandle: [checkUser(permission['POST_/api/starlink-usage/sync'])],
    query: t.Object({
      datekey: t.Optional(
        t.String({
          description:
            'Optional date key to sync specific date (format: YYYYMMDD)',
          example: '20250810',
        })
      ),
    }),
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Sync starlink usage data',
      description:
        'Fetch and synchronize starlink usage data from external API. If datekey is provided, syncs data for that specific date, otherwise syncs latest data.',
      operationId: 'syncStarlinkUsage',
    },
  })

  .post(
    '/sync-by-range',
    StarlinkUsageController.syncStarlinkUsageByDateRange,
    {
      beforeHandle: [
        checkUser(permission['POST_/api/starlink-usage/sync-by-range']),
      ],
      body: t.Object({
        startDate: t.String({
          description: 'Start date for the sync range (format: YYYYMMDD)',
          example: '20250901',
        }),
        endDate: t.String({
          description: 'End date for the sync range (format: YYYYMMDD)',
          example: '20251012',
        }),
      }),
      tags: ['Starlink Usage'],
      detail: {
        summary: 'Sync starlink usage data by date range',
        description:
          'Fetch and synchronize starlink usage data for a range of dates. This will process all dates between startDate and endDate (inclusive) in the background.',
        operationId: 'syncStarlinkUsageByDateRange',
      },
    }
  )

  .get('/date-range', StarlinkUsageController.getStarlinkUsageByDateRange, {
    beforeHandle: [checkUser(permission['GET_/api/starlink-usage/date-range'])],
    query: t.Object({
      startDate: t.String({
        description: 'Start date for the range (format: YYYYMMDD)',
        example: '20250801',
      }),
      endDate: t.String({
        description: 'End date for the range (format: YYYYMMDD)',
        example: '20250831',
      }),
    }),
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Get starlink usage data by date range',
      description:
        'Retrieve starlink usage data within a specified date range with populated vessel and vessel group information. Returns detailed usage statistics and vessel details.',
      operationId: 'getStarlinkUsageByDateRange',
    },
  })

  .get('/kit-data', StarlinkUsageController.getStarlinkUsageKitData, {
    beforeHandle: [checkUser(permission['GET_/api/starlink-usage/kit-data'])],
    query: t.Object({
      startDate: t.String({
        description: 'Start date for the range (format: YYYYMMDD)',
        example: '20250801',
      }),
      endDate: t.String({
        description: 'End date for the range (format: YYYYMMDD)',
        example: '20250831',
      }),
      kitNumber: t.Optional(
        t.String({
          description: 'Optional kit number to filter by',
          example: 'KITP00118430',
        })
      ),
      groupName: t.Optional(
        t.String({
          description: 'Optional group name to filter by',
          example: 'GROUP1',
        })
      ),
      vesselName: t.Optional(
        t.String({
          description: 'Optional vessel name to filter by',
          example: 'VESSEL1',
        })
      ),
      currentPage: t.Optional(
        t.String({
          description: 'Page number for pagination (default: 1)',
          example: '1',
        })
      ),
      pageSize: t.Optional(
        t.String({
          description: 'Number of items per page (default: 10)',
          example: '10',
        })
      ),
      all: t.Optional(
        t.String({
          description: 'Retrieve all records without pagination (true/false)',
          example: 'false',
        })
      ),
    }),
    tags: ['Starlink Usage'],
    detail: {
      summary: 'Get starlink kit usage data',
      description:
        'Retrieve starlink usage data formatted for kit visualization, including mobile priority and standard GB usage over time.',
      operationId: 'getStarlinkUsageKitData',
    },
  })
  .get('/stats', StarlinkUsageController.getStarlinkUsageStats, {
    beforeHandle: [checkUser(permission['GET_/api/starlink-usage/stats'])],
    query: t.Object({
      kitNumber: t.Optional(
        t.String({
          description: 'Optional kit number to get stats for specific kit',
          example: 'KITP00118430',
        })
      ),
      currentPage: t.Optional(
        t.String({
          description: 'Current Page number',
          default: '1',
        })
      ),
      pageSize: t.Optional(
        t.String({
          description: 'Number of items per page',
          default: '10',
        })
      ),
      all: t.Optional(
        t.String({
          description: 'Retrieve all starlink usage (true/false)',
          default: 'false',
        })
      ),
    }),
    tags: ['Starlink Usage Statistics'],
    detail: {
      summary: 'Get comprehensive starlink usage statistics',
      description:
        'Retrieve detailed usage statistics including 7/30/60 day usage, lifetime usage, averages, and breakdown data from materialized view.',
      operationId: 'getStarlinkUsageStats',
    },
  })

  .get('/system-summary', StarlinkUsageController.getStarlinkSystemSummary, {
    beforeHandle: [
      checkUser(permission['GET_/api/starlink-usage/system-summary']),
    ],
    tags: ['Starlink Usage Statistics'],
    detail: {
      summary: 'Get system-wide starlink usage summary',
      description:
        'Retrieve overall system statistics including total vessels, vessel groups, lifetime usage, and system averages.',
      operationId: 'getStarlinkSystemSummary',
    },
  })

  .get('/top-usage', StarlinkUsageController.getTopUsageKits, {
    beforeHandle: [checkUser(permission['GET_/api/starlink-usage/top-usage'])],
    query: t.Object({
      limit: t.Optional(
        t.String({
          description: 'Number of top kits to return (default: 10)',
          example: '10',
        })
      ),
      period: t.Optional(
        t.Union(
          [
            t.Literal('7'),
            t.Literal('30'),
            t.Literal('60'),
            t.Literal('lifetime'),
          ],
          {
            description: 'Time period for ranking (default: 60)',
            example: '60',
          }
        )
      ),
    }),
    tags: ['Starlink Usage Statistics'],
    detail: {
      summary: 'Get top usage kits',
      description:
        'Retrieve the highest usage kits for a specified time period (7, 30, 60 days, or lifetime).',
      operationId: 'getTopUsageKits',
    },
  })

  .get('/trends', StarlinkUsageController.getUsageTrends, {
    beforeHandle: [checkUser(permission['GET_/api/starlink-usage/trends'])],
    tags: ['Starlink Usage Statistics'],
    detail: {
      summary: 'Get usage trends',
      description:
        'Retrieve daily usage trends for the last 60 days across all kits, including usage changes and active kit counts.',
      operationId: 'getUsageTrends',
    },
  })

  .get('/analytics', StarlinkUsageController.getAnalytics, {
    beforeHandle: [checkUser(permission['GET_/api/starlink-usage/analytics'])],
    query: t.Object({
      period: t.Optional(
        t.Union([t.Literal('week'), t.Literal('month'), t.Literal('year')], {
          description: 'Time period for analytics (default: week)',
          example: 'week',
        })
      ),
    }),
    tags: ['Starlink Usage Analytics'],
    detail: {
      summary: 'Get analytics data',
      description:
        'Retrieve comprehensive analytics data including metrics, vessel analytics, top organizations, and top vessels for this week, month, and year periods.',
      operationId: 'getAnalytics',
    },
  });

export { permission };
export default starlinkUsageRoute;
