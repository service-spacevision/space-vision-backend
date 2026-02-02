import { sql } from "drizzle-orm";

// Materialized view SQL definitions
export const CREATE_STARLINK_USAGE_STATS_MV = sql`
  CREATE MATERIALIZED VIEW starlink_usage_stats_mv AS
  WITH last_60_days AS (
    SELECT 
      kit_number,
      vessel_name,
      to_date(date_key, 'YYYYMMDD') as usage_date,
      mobile_priority_gb,
      standard_gb,
      COALESCE(mobile_priority_gb, 0) + COALESCE(standard_gb, 0) as total_gb,
      usage_limit_gb,
      public_ip_enabled,
      chargebee_subscription_id
    FROM starlink_usage
    WHERE to_date(date_key, 'YYYYMMDD') >= (current_date - interval '60 days')
    ORDER BY date_key
  ),
  last_30_days AS (
    SELECT 
      kit_number,
      COALESCE(mobile_priority_gb, 0) + COALESCE(standard_gb, 0) as total_gb
    FROM starlink_usage
    WHERE to_date(date_key, 'YYYYMMDD') >= (current_date - interval '30 days')
  ),
  last_7_days AS (
    SELECT 
      kit_number,
      COALESCE(mobile_priority_gb, 0) + COALESCE(standard_gb, 0) as total_gb
    FROM starlink_usage
    WHERE to_date(date_key, 'YYYYMMDD') >= (current_date - interval '7 days')
  ),
  lifetime_usage AS (
    SELECT 
      kit_number,
      SUM(COALESCE(mobile_priority_gb, 0) + COALESCE(standard_gb, 0)) as lifetime_usage_gb,
      MIN(to_date(date_key, 'YYYYMMDD')) as first_usage_date,
      MAX(to_date(date_key, 'YYYYMMDD')) as last_usage_date,
      COUNT(DISTINCT date_key) as total_days_with_usage
    FROM starlink_usage
    GROUP BY kit_number
  ),
  system_stats AS (
    SELECT 
      COUNT(DISTINCT v.vesselskit_number) as total_vessels,
      COUNT(DISTINCT vg.id) as total_vessel_groups,
      SUM(COALESCE(su.mobile_priority_gb, 0) + COALESCE(su.standard_gb, 0)) as total_lifetime_usage_gb,
      COUNT(DISTINCT su.kit_number) as total_active_kits
    FROM starlink_usage su
    LEFT JOIN vessels v ON v.vesselskit_number = su.kit_number
    LEFT JOIN vessel_groups vg ON vg.id = v.group_id
  )
  SELECT 
    COALESCE(l60.kit_number, lt.kit_number) as kit_number,
    MAX(l60.vessel_name) as vessel_name,
    COALESCE(SUM(l60.total_gb), 0) as last_60_days_usage_gb,
    COALESCE(SUM(l30.total_gb), 0) as last_30_days_usage_gb,
    COALESCE(SUM(l7.total_gb), 0) as last_7_days_usage_gb,
    COALESCE(MAX(lt.lifetime_usage_gb), 0) as lifetime_usage_gb,
    MAX(lt.first_usage_date) as first_usage_date,
    MAX(lt.last_usage_date) as last_usage_date,
    MAX(lt.total_days_with_usage) as total_days_with_usage,
    jsonb_agg(
      CASE 
        WHEN l60.usage_date IS NOT NULL THEN
          jsonb_build_object(
            'date', l60.usage_date,
            'mobilePriorityGb', COALESCE(l60.mobile_priority_gb, 0),
            'standardGb', COALESCE(l60.standard_gb, 0),
            'totalGb', l60.total_gb,
            'usageLimitGB', l60.usage_limit_gb,
            'publicIP_Enabled', l60.public_ip_enabled,
            'chargebeeSubscriptionId', l60.chargebee_subscription_id
          )
        ELSE NULL
      END
      ORDER BY l60.usage_date
    ) FILTER (WHERE l60.usage_date IS NOT NULL) as last_60_days_breakdown,
    CASE 
      WHEN COUNT(l60.usage_date) > 0 
      THEN COALESCE(SUM(l60.total_gb), 0) / COUNT(l60.usage_date)
      ELSE 0 
    END as avg_daily_usage_last_60_days,
    CASE 
      WHEN COUNT(l30.total_gb) > 0 
      THEN COALESCE(SUM(l30.total_gb), 0) / COUNT(l30.total_gb)
      ELSE 0 
    END as avg_daily_usage_last_30_days,
    MAX(l60.usage_limit_gb) as current_usage_limit,
    BOOL_OR(l60.public_ip_enabled) as current_public_ip_enabled,
    MAX(l60.chargebee_subscription_id) as current_subscription_id,
    MAX(ss.total_vessels) as system_total_vessels,
    MAX(ss.total_vessel_groups) as system_total_vessel_groups,
    MAX(ss.total_lifetime_usage_gb) as system_total_lifetime_usage_gb,
    MAX(ss.total_active_kits) as system_total_active_kits,
    NOW() as last_updated
  FROM (SELECT NULL) as dummy
  LEFT JOIN last_60_days l60 ON true
  LEFT JOIN last_30_days l30 ON l30.kit_number = l60.kit_number
  LEFT JOIN last_7_days l7 ON l7.kit_number = l60.kit_number
  LEFT JOIN lifetime_usage lt ON lt.kit_number = l60.kit_number
  CROSS JOIN system_stats ss
  GROUP BY COALESCE(l60.kit_number, lt.kit_number)
  HAVING COALESCE(l60.kit_number, lt.kit_number) IS NOT NULL
`;

export const CREATE_STARLINK_SYSTEM_SUMMARY_MV = sql`
  CREATE MATERIALIZED VIEW starlink_system_summary_mv AS
  SELECT 
    COUNT(DISTINCT v.vesselskit_number) as total_vessels,
    COUNT(DISTINCT vg.id) as total_vessel_groups,
    COUNT(DISTINCT su.kit_number) as total_active_kits,
    SUM(COALESCE(su.mobile_priority_gb, 0) + COALESCE(su.standard_gb, 0)) as total_lifetime_usage_gb,
    SUM(
      CASE 
        WHEN to_date(su.date_key, 'YYYYMMDD') >= (current_date - interval '60 days')
        THEN COALESCE(su.mobile_priority_gb, 0) + COALESCE(su.standard_gb, 0)
        ELSE 0
      END
    ) as total_last_60_days_usage_gb,
    SUM(
      CASE 
        WHEN to_date(su.date_key, 'YYYYMMDD') >= (current_date - interval '30 days')
        THEN COALESCE(su.mobile_priority_gb, 0) + COALESCE(su.standard_gb, 0)
        ELSE 0
      END
    ) as total_last_30_days_usage_gb,
    SUM(
      CASE 
        WHEN to_date(su.date_key, 'YYYYMMDD') >= (current_date - interval '7 days')
        THEN COALESCE(su.mobile_priority_gb, 0) + COALESCE(su.standard_gb, 0)
        ELSE 0
      END
    ) as total_last_7_days_usage_gb,
    MIN(to_date(su.date_key, 'YYYYMMDD')) as earliest_usage_date,
    MAX(to_date(su.date_key, 'YYYYMMDD')) as latest_usage_date,
    CASE 
      WHEN COUNT(DISTINCT su.kit_number) > 0 
      THEN SUM(COALESCE(su.mobile_priority_gb, 0) + COALESCE(su.standard_gb, 0)) / COUNT(DISTINCT su.kit_number)
      ELSE 0 
    END as avg_usage_per_kit,
    CASE 
      WHEN COUNT(DISTINCT su.date_key) > 0 
      THEN SUM(COALESCE(su.mobile_priority_gb, 0) + COALESCE(su.standard_gb, 0)) / COUNT(DISTINCT su.date_key)
      ELSE 0 
    END as avg_daily_system_usage,
    COUNT(DISTINCT CASE WHEN su.public_ip_enabled = true THEN su.kit_number END) as kits_with_public_ip_enabled,
    NOW() as last_updated
  FROM starlink_usage su
  LEFT JOIN vessels v ON v.vesselskit_number = su.kit_number
  LEFT JOIN vessel_groups vg ON vg.id = v.group_id
`;

// Drop statements
export const DROP_STARLINK_USAGE_STATS_MV = sql`DROP MATERIALIZED VIEW IF EXISTS starlink_usage_stats_mv CASCADE`;
export const DROP_STARLINK_SYSTEM_SUMMARY_MV = sql`DROP MATERIALIZED VIEW IF EXISTS starlink_system_summary_mv CASCADE`;

// Refresh statements
export const REFRESH_STARLINK_USAGE_STATS_MV = sql`REFRESH MATERIALIZED VIEW starlink_usage_stats_mv`;
export const REFRESH_STARLINK_SYSTEM_SUMMARY_MV = sql`REFRESH MATERIALIZED VIEW starlink_system_summary_mv`;

// Index creation statements
export const CREATE_STARLINK_USAGE_STATS_INDEXES = [
  sql`CREATE INDEX IF NOT EXISTS idx_starlink_usage_stats_mv_kit_number ON starlink_usage_stats_mv(kit_number)`,
  sql`CREATE INDEX IF NOT EXISTS idx_starlink_usage_stats_mv_last_updated ON starlink_usage_stats_mv(last_updated)`
];

export type StarlinkUsageStats = {
  kitNumber: string;
  vesselName: string | null;
  last60DaysUsageGb: number;
  last30DaysUsageGb: number;
  last7DaysUsageGb: number;
  lifetimeUsageGb: number;
  firstUsageDate: Date | null;
  lastUsageDate: Date | null;
  totalDaysWithUsage: number;
  last60DaysBreakdown: any[] | null;
  avgDailyUsageLast60Days: number;
  avgDailyUsageLast30Days: number;
  currentUsageLimit: number | null;
  currentPublicIpEnabled: boolean | null;
  currentSubscriptionId: string | null;
  systemTotalVessels: number;
  systemTotalVesselGroups: number;
  systemTotalLifetimeUsageGb: number;
  systemTotalActiveKits: number;
  lastUpdated: Date;
};

export type StarlinkSystemSummary = {
  totalVessels: number;
  totalVesselGroups: number;
  totalActiveKits: number;
  totalLifetimeUsageGb: number;
  totalLast60DaysUsageGb: number;
  totalLast30DaysUsageGb: number;
  totalLast7DaysUsageGb: number;
  earliestUsageDate: Date | null;
  latestUsageDate: Date | null;
  avgUsagePerKit: number;
  avgDailySystemUsage: number;
  kitsWithPublicIpEnabled: number;
  lastUpdated: Date;
};