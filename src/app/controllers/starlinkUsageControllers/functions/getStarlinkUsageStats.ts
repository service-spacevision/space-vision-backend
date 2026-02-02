import { db } from '../../../db/connection'
import { sql, and } from 'drizzle-orm'
import { AuthUser, IPagination } from '../../../utils/types'
import { isAdmin } from '../../../../utils/permissionUtils'

interface GetStarlinkUsageStatsParams {
  reqObject: {
    user: AuthUser
  }
  kitNumber?: string
  pagination?: IPagination
}

export async function getStarlinkUsageStats_func({ reqObject, kitNumber, pagination }: GetStarlinkUsageStatsParams) {
  try {
    const { user } = reqObject;
    console.log("requestedBy", user);

    // Build where conditions
    const whereConditions = [];
    
    if (kitNumber) {
      whereConditions.push(sql`kit_number = ${kitNumber}`);
    }
    
    // Add vessel group filter for non-admin users
    if (!isAdmin(user) && user.role?.permittedVesselGroups?.length) {
      whereConditions.push(sql`vessel_group_id = ANY(${user.role.permittedVesselGroups})`);
    }
    
    const whereSql = whereConditions.length > 0 
      ? sql`WHERE ${and(...whereConditions)}` 
      : sql``;

    // If pagination.all is set, return all records without pagination
    if (pagination?.all === 'true' || pagination?.all === '1') {
      const statsAll = await db.execute(sql`
        SELECT *
        FROM starlink_usage_stats_mv
        ${whereSql}
        ORDER BY last_updated DESC
      `)

      return {
        success: true,
        message: 'Starlink usage statistics retrieved successfully',
        data: statsAll,
        pagination: {
          total: statsAll.length,
          page: 1,
          pageSize: statsAll.length
        }
      }
    }

    // Default pagination values
    const page = pagination?.currentPage || 1
    const pageSize = pagination?.pageSize || 10
    const offset = (page - 1) * pageSize

    // Get total count
    const countRows = await db.execute(sql`
      SELECT COUNT(*)::int as count
      FROM starlink_usage_stats_mv
      ${whereSql}
    `)
    const total = Number((countRows as any)[0]?.count ?? 0)

    // Get paginated data
    const stats = await db.execute(sql`
      SELECT *
      FROM starlink_usage_stats_mv
      ${whereSql}
      ORDER BY last_updated DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `)

    return {
      success: true,
      message: 'Starlink usage statistics retrieved successfully',
      data: stats,
      pagination: {
        total,
        page,
        pageSize
      }
    }

  } catch (error: any) {
    console.error('Error getting starlink usage stats:', error)
    return {
      success: false,
      message: 'Failed to retrieve starlink usage statistics',
      error: error.message
    }
  }
}

export async function getStarlinkSystemSummary_func({ reqObject }: { reqObject: { user: AuthUser } }) {
  try {
    const { user } = reqObject;
    
    // Build where conditions
    const whereConditions = [];
    
    // Add vessel group filter for non-admin users
    if (!isAdmin(user) && user.role?.permittedVesselGroups?.length) {
      whereConditions.push(sql`vessel_group_id = ANY(${user.role.permittedVesselGroups})`);
    }
    
    const whereSql = whereConditions.length > 0 
      ? sql`WHERE ${and(...whereConditions)}` 
      : sql``;

    const summary = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT kit_number) as total_kits,
        COUNT(DISTINCT vessel_name) as total_vessels,
        COUNT(DISTINCT vessel_group_id) as total_groups,
        COALESCE(SUM(total_usage_gb), 0) as total_usage_gb,
        COALESCE(SUM(usage_limit_gb), 0) as total_allocated_gb,
        COALESCE(SUM(usage_percentage) / NULLIF(COUNT(*), 0), 0) as avg_usage_percentage
      FROM starlink_usage_stats_mv
      ${whereSql}
    `);

    return {
      success: true,
      message: 'System summary retrieved successfully',
      data: summary[0]
    };
  } catch (error: any) {
    console.error('Error getting system summary:', error);
    return {
      success: false,
      message: 'Failed to retrieve system summary',
      error: error.message
    };
  }
}

export async function getTopUsageKits_func({ 
  reqObject, 
  limit = 10, 
  period = '60' 
}: { 
  reqObject: { user: AuthUser }
  limit?: number
  period?: '7' | '30' | '60' | 'lifetime'
}) {
  try {
    const { user } = reqObject;
    
    // Build where conditions
    const whereConditions = [];
    
    // Add vessel group filter for non-admin users
    if (!isAdmin(user) && user.role?.permittedVesselGroups?.length) {
      whereConditions.push(sql`vessel_group_id = ANY(${user.role.permittedVesselGroups})`);
    }
    
    // Add period filter
    if (period !== 'lifetime') {
      const days = parseInt(period, 10);
      whereConditions.push(sql`last_updated >= NOW() - INTERVAL '${days} days'`);
    }
    
    const whereSql = whereConditions.length > 0 
      ? sql`WHERE ${and(...whereConditions)}` 
      : sql``;

    let orderByColumn = 'last_60_days_usage_gb';
    switch (period) {
      case '7':
        orderByColumn = 'last_7_days_usage_gb';
        break;
      case '30':
        orderByColumn = 'last_30_days_usage_gb';
        break;
      case 'lifetime':
        orderByColumn = 'lifetime_usage_gb';
        break;
      default:
        orderByColumn = 'last_60_days_usage_gb';
    }

    const topKits = await db.execute(sql`
      SELECT 
        kit_number,
        vessel_name,
        vessel_group_name,
        last_7_days_usage_gb,
        last_30_days_usage_gb,
        last_60_days_usage_gb,
        lifetime_usage_gb,
        avg_daily_usage_last_60_days,
        current_usage_limit,
        current_public_ip_enabled
      FROM starlink_usage_stats_mv 
      ${whereSql}
      ORDER BY ${sql.raw(orderByColumn)} DESC 
      LIMIT ${limit}
    `)

    return {
      success: true,
      message: `Top ${limit} usage kits for ${period} days retrieved successfully`,
      data: topKits
    }

  } catch (error: any) {
    console.error('Error getting top usage kits:', error)
    return {
      success: false,
      message: 'Failed to retrieve top usage kits',
      error: error.message
    }
  }
}

export async function getUsageTrends_func({ reqObject }: { reqObject: { user: AuthUser } }) {
  try {
    const { user } = reqObject;
    
    // Build where conditions
    const whereConditions = [];
    
    // Add vessel group filter for non-admin users
    if (!isAdmin(user) && user.role?.permittedVesselGroups?.length) {
      whereConditions.push(sql`vessel_group_id = ANY(${user.role.permittedVesselGroups})`);
    }
    
    const whereSql = whereConditions.length > 0 
      ? sql`AND ${and(...whereConditions)}` 
      : sql``;

    // Get daily usage trends for the last 60 days across all kits
    const trends = await db.execute(sql`
      WITH daily_totals AS (
        SELECT 
          to_date(date_key, 'YYYYMMDD') as usage_date,
          SUM(COALESCE(mobile_priority_gb, 0) + COALESCE(standard_gb, 0)) as total_usage_gb,
          COUNT(DISTINCT kit_number) as active_kits,
          AVG(COALESCE(mobile_priority_gb, 0) + COALESCE(standard_gb, 0)) as avg_usage_per_kit
        FROM starlink_usage
        WHERE to_date(date_key, 'YYYYMMDD') >= (current_date - interval '60 days')
        ${whereSql}
        GROUP BY to_date(date_key, 'YYYYMMDD')
        ORDER BY usage_date
      )
      SELECT 
        usage_date,
        total_usage_gb,
        active_kits,
        avg_usage_per_kit,
        LAG(total_usage_gb) OVER (ORDER BY usage_date) as prev_day_usage,
        total_usage_gb - LAG(total_usage_gb) OVER (ORDER BY usage_date) as usage_change
      FROM daily_totals
    `)

    return {
      success: true,
      message: 'Usage trends retrieved successfully',
      data: trends
    }

  } catch (error: any) {
    console.error('Error getting usage trends:', error)
    return {
      success: false,
      message: 'Failed to retrieve usage trends',
      error: error.message
    }
  }
}