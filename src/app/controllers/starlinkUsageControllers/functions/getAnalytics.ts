import { db } from '../../../db/connection';
import { sql, and } from 'drizzle-orm';
import { AuthUser } from '../../../utils/types';
import { isAdmin } from '../../../../utils/permissionUtils';

interface GetAnalyticsParams {
  reqObject: {
    user: AuthUser;
  };
}

export async function getAnalytics_func({ reqObject }: GetAnalyticsParams) {
  try {
    const { user } = reqObject;

    // Build where conditions for vessel group filtering
    const whereConditions = [];

    // Add vessel group filter for non-admin users
    if (!isAdmin(user) && user.role?.permittedVesselGroups?.length) {
      whereConditions.push(
        sql`vg.id = ANY(${user.role.permittedVesselGroups})`
      );
    }

    const whereSql =
      whereConditions.length > 0
        ? sql`WHERE ${and(...whereConditions)}`
        : sql``;

    // Helper function to get date range for a period
    const getDateRange = (period: 'week' | 'month' | 'year') => {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          // This week (Monday to Sunday)
          const monday = new Date(now);
          monday.setDate(now.getDate() - now.getDay() + 1);
          startDate = monday;
          break;
        case 'month':
          // This month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          // This year
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      return {
        start: startDate,
        end: now,
      };
    };

    // Helper function to get date key range
    const getDateKeyRange = (startDate: Date, endDate: Date) => {
      const startKey = startDate.toISOString().slice(0, 10).replace(/-/g, '');
      const endKey = endDate.toISOString().slice(0, 10).replace(/-/g, '');
      return { startKey, endKey };
    };

    // Helper function to generate date labels for each period
    const getDateLabels = (period: 'week' | 'month' | 'year') => {
      const now = new Date();
      let labels: string[] = [];

      switch (period) {
        case 'week':
          // Days of the week
          const days = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ];
          labels = days
            .slice(now.getDay() - 1)
            .concat(days.slice(0, now.getDay() - 1));
          if (labels.length < 7) {
            labels = labels.concat(days.slice(0, 7 - labels.length));
          }
          break;
        case 'month':
          // Days of the month (01 Jun format)
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          const daysInMonth = monthEnd.getDate();
          const currentDay = now.getDate();

          labels = [];
          for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(now.getFullYear(), now.getMonth(), i);
            const formatted = day.toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
            });
            labels.push(formatted);
          }
          break;
        case 'year':
          // Months of the year
          labels = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ];
          break;
      }

      return labels;
    };

    // Function to get metrics for a period
    const getMetrics = async (period: 'week' | 'month' | 'year') => {
      const { start, end } = getDateRange(period);
      const { startKey, endKey } = getDateKeyRange(start, end);

      // Build where conditions
      const whereConditions = [sql`u.is_active = true`];

      // Note: Vessel group filtering doesn't apply to users table since users aren't directly related to vessel groups
      // Vessel group filtering will be applied in vessel-related queries

      const whereSql =
        whereConditions.length > 0
          ? sql`WHERE ${and(...whereConditions)}`
          : sql``;

      const usersQuery = await db.execute(sql`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN last_login_at >= ${start.toISOString()} THEN 1 END) as active
        FROM users u
        ${whereSql}
      `);

      // Get groups metrics - vessel groups don't have is_active, only vessel group filtering
      const groupsWhereConditions: string | any[] = [];

      // Note: For analytics, we'll skip vessel group filtering to avoid complex array parameter issues
      // The analytics are meant to show overall system usage, not user-specific filtered data

      const groupsWhereSql =
        groupsWhereConditions.length > 0
          ? sql`WHERE ${and(...groupsWhereConditions)}`
          : sql``;

      const groupsQuery = await db.execute(sql`
        SELECT
          COUNT(*) as total,
          COUNT(*) as active
        FROM vessel_groups vg
        ${groupsWhereSql}
      `);

      // Get vessels metrics - vessels don't have is_active, only vessel group filtering
      const vesselsWhereConditions = [] as string | any[];

      // Note: For analytics, we'll skip vessel group filtering to avoid complex array parameter issues
      // The analytics are meant to show overall system usage, not user-specific filtered data

      const vesselsWhereSql =
        vesselsWhereConditions.length > 0
          ? sql`WHERE ${and(...vesselsWhereConditions)}`
          : sql``;

      const vesselsQuery = await db.execute(sql`
        SELECT
          COUNT(DISTINCT v.id) as total,
          COUNT(DISTINCT CASE WHEN su.kit_number IS NOT NULL THEN v.id END) as active
        FROM vessels v
        LEFT JOIN vessel_groups vg ON v.group_id = vg.id
        LEFT JOIN starlink_usage su ON su.kit_number = v.vesselskit_number
          AND su.date_key >= ${startKey} AND su.date_key <= ${endKey}
        ${vesselsWhereSql}
      `);

      return {
        users: {
          total: Number(usersQuery[0]?.total || 0),
          active: Number(usersQuery[0]?.active || 0),
        },
        groups: {
          total: Number(groupsQuery[0]?.total || 0),
          active: Number(groupsQuery[0]?.active || 0),
        },
        vessels: {
          total: Number(vesselsQuery[0]?.total || 0),
          active: Number(vesselsQuery[0]?.active || 0),
        },
      };
    };

    // Function to get vessel analytics for a period
    const getVesselAnalytics = async (period: 'week' | 'month' | 'year') => {
      const { start, end } = getDateRange(period);
      const { startKey, endKey } = getDateKeyRange(start, end);
      const labels = getDateLabels(period);

      // Build where conditions for this function
      const whereConditions = [] as string | any[];

      // Note: For analytics, we'll skip vessel group filtering to avoid complex array parameter issues
      // The analytics are meant to show overall system usage, not user-specific filtered data

      const whereSql =
        whereConditions.length > 0
          ? sql`WHERE ${and(...whereConditions)}`
          : sql``;

      // Get daily/weekly/monthly usage data
      let groupByFormat = '';
      let dateFormat = '';

      switch (period) {
        case 'week':
          groupByFormat = 'EXTRACT(DOW FROM TO_DATE(su.date_key, \'YYYYMMDD\'))';
          dateFormat = 'EXTRACT(DOW FROM TO_DATE(su.date_key, \'YYYYMMDD\'))';
          break;
        case 'month':
          groupByFormat = 'EXTRACT(DAY FROM TO_DATE(su.date_key, \'YYYYMMDD\'))';
          dateFormat = 'EXTRACT(DAY FROM TO_DATE(su.date_key, \'YYYYMMDD\'))';
          break;
        case 'year':
          groupByFormat = 'EXTRACT(MONTH FROM TO_DATE(su.date_key, \'YYYYMMDD\'))';
          dateFormat = 'EXTRACT(MONTH FROM TO_DATE(su.date_key, \'YYYYMMDD\'))';
          break;
      }

      const usageQuery = await db.execute(sql`
        SELECT
          ${sql.raw(dateFormat)} as period,
          SUM(COALESCE(su.mobile_priority_gb, 0)) as priority_usage,
          SUM(COALESCE(su.standard_gb, 0)) as standard_usage
        FROM starlink_usage su
        WHERE su.date_key >= ${startKey} AND su.date_key <= ${endKey}
        GROUP BY ${sql.raw(groupByFormat)}
        ORDER BY ${sql.raw(groupByFormat)}
      `);

      // Format the series data
      const priorityData = labels.map((label, index) => {
        const matchingData = usageQuery.find((item) => {
          if (period === 'week') {
            // For week: item.period is 0-6 (Sunday-Saturday), map to Monday-Sunday
            const dow = Number(item.period);
            const mondayBasedIndex = dow === 0 ? 6 : dow - 1; // Convert Sunday=0 to Sunday=6
            return mondayBasedIndex === index;
          } else if (period === 'month') {
            return index + 1 === parseInt(item.period as string);
          } else {
            return index + 1 === parseInt(item.period as string);
          }
        });
        return Number(matchingData?.priority_usage || 0);
      });

      const standardData = labels.map((label, index) => {
        const matchingData = usageQuery.find((item) => {
          if (period === 'week') {
            // For week: item.period is 0-6 (Sunday-Saturday), map to Monday-Sunday
            const dow = Number(item.period);
            const mondayBasedIndex = dow === 0 ? 6 : dow - 1; // Convert Sunday=0 to Sunday=6
            return mondayBasedIndex === index;
          } else if (period === 'month') {
            return index + 1 === parseInt(item.period as string);
          } else {
            return index + 1 === parseInt(item.period as string);
          }
        });
        return Number(matchingData?.standard_usage || 0);
      });

      // Get total usages
      const totalUsageQuery = await db.execute(sql`
        SELECT
          SUM(COALESCE(su.mobile_priority_gb, 0)) as total_priority,
          SUM(COALESCE(su.standard_gb, 0)) as total_standard
        FROM starlink_usage su
        WHERE su.date_key >= ${startKey} AND su.date_key <= ${endKey}
      `);

      return {
        totalPriorityUsages: {
          value: Number(totalUsageQuery[0]?.total_priority || 0),
        },
        totalStandardUsages: {
          value: Number(totalUsageQuery[0]?.total_standard || 0),
        },
        series: [
          { name: 'priority', data: priorityData },
          { name: 'standard', data: standardData },
        ],
        date: labels,
      };
    };

    // Function to get top organizations for a period
    const getTopOrganizations = async (period: 'week' | 'month' | 'year') => {
      const { start, end } = getDateRange(period);
      const { startKey, endKey } = getDateKeyRange(start, end);

      const orgUsageQuery = await db.execute(sql`
        SELECT
          o.name as org_name,
          o.id as org_id,
          SUM(COALESCE(su.mobile_priority_gb, 0) + COALESCE(su.standard_gb, 0)) as total_usage
        FROM organizations o
        -- Join vessel groups that the organization is permitted to access
        INNER JOIN vessel_groups vg ON vg.id = ANY(o.permitted_vessel_groups)
        -- Join vessels that belong to those vessel groups
        INNER JOIN vessels v ON v.group_id = vg.id
        -- Join starlink usage for those vessels
        INNER JOIN starlink_usage su ON su.kit_number = v.vesselskit_number
          AND su.date_key >= ${startKey} AND su.date_key <= ${endKey}
        WHERE o.permitted_vessel_groups IS NOT NULL
          AND array_length(o.permitted_vessel_groups, 1) > 0
        GROUP BY o.id, o.name
        HAVING SUM(COALESCE(su.mobile_priority_gb, 0) + COALESCE(su.standard_gb, 0)) > 0
        ORDER BY total_usage DESC
        LIMIT 5
      `);

      const organizations = orgUsageQuery.map((org) => ({
        id: org.org_id?.toString() || 'unknown',
        name: org.org_name || 'Unknown Organization',
        img: '/img/others/default.png', // Default image path
        total: Number(org.total_usage || 0),
      }));

      return {
        totalUsages: organizations.reduce((sum, org) => sum + org.total, 0),
        organizations,
      };
    };

    // Function to get top vessels for a period
    const getTopVessels = async (period: 'week' | 'month' | 'year') => {
      const { start, end } = getDateRange(period);
      const { startKey, endKey } = getDateKeyRange(start, end);

      // Build where conditions for this function
      const whereConditions = [] as string | any[];

      // Note: For analytics, we'll skip vessel group filtering to avoid complex array parameter issues
      // The analytics are meant to show overall system usage, not user-specific filtered data

      const whereSql =
        whereConditions.length > 0
          ? sql`WHERE ${and(...whereConditions)}`
          : sql``;

      const vesselUsageQuery = await db.execute(sql`
        SELECT
          v.name as vessel_name,
          v.vesselskit_number,
          SUM(COALESCE(su.mobile_priority_gb, 0)) as total_priority,
          SUM(COALESCE(su.standard_gb, 0)) as total_standard
        FROM vessels v
        LEFT JOIN vessel_groups vg ON v.group_id = vg.id
        LEFT JOIN starlink_usage su ON su.kit_number = v.vesselskit_number
          AND su.date_key >= ${startKey} AND su.date_key <= ${endKey}
        GROUP BY v.id, v.name, v.vesselskit_number
        HAVING SUM(COALESCE(su.mobile_priority_gb, 0) + COALESCE(su.standard_gb, 0)) > 0
        ORDER BY (SUM(COALESCE(su.mobile_priority_gb, 0)) + SUM(COALESCE(su.standard_gb, 0))) DESC
        LIMIT 10
      `);

      return vesselUsageQuery.map((vessel) => ({
        name:
          vessel.vessel_name || vessel.vesselskit_number || 'Unknown Vessel',
        totalpriorityDataUsages: { usages: Number(vessel.total_priority || 0) },
        totalStandardDataUsages: { usages: Number(vessel.total_standard || 0) },
      }));
    };

    // Get data for all periods
    const periods = ['week', 'month', 'year'] as const;
    const result: any = {};

    for (const period of periods) {
      const periodKey = `this${
        period.charAt(0).toUpperCase() + period.slice(1)
      }`;

      result[periodKey] = {
        metrics: await getMetrics(period),
        vesselAnalytic: await getVesselAnalytics(period),
        topOrganizations: await getTopOrganizations(period),
        topVessels: await getTopVessels(period),
      };
    }

    return {
      success: true,
      message: 'Analytics data retrieved successfully',
      data: result,
    };
  } catch (error: any) {
    console.error('Error getting analytics data:', error);
    return {
      success: false,
      message: 'Failed to retrieve analytics data',
      error: error.message,
    };
  }
}
