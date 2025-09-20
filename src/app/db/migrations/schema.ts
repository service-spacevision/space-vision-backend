import { pgTable, serial, text, integer, numeric, timestamp, unique, varchar, boolean, jsonb, uniqueIndex, index, real, doublePrecision, foreignKey, primaryKey, pgMaterializedView, date, bigint, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const permissionCategory = pgEnum("permission_category", ['navigation', 'component', 'api'])
export const permissionScope = pgEnum("permission_scope", ['own', 'organization', 'all'])


export const mikrotikUsageSession = pgTable("mikrotik_usage_session", {
	id: serial().primaryKey().notNull(),
	vesselName: text("vessel_name").notNull(),
	username: text().notNull(),
	ip: text(),
	mac: text(),
	uptime: text(),
	rxMb: integer("rx_mb").default(0).notNull(),
	txMb: integer("tx_mb").default(0).notNull(),
	totalAllowedMb: integer("total_allowed_mb").default(5000).notNull(),
	percentageUsed: numeric("percentage_used", { precision: 5, scale:  1 }).default('0.0').notNull(),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow(),
});

export const groupAccess = pgTable("group_access", {
	id: serial().primaryKey().notNull(),
	role: integer().notNull(),
	groupId: integer("group_id").array().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }),
	fullName: varchar("full_name", { length: 200 }),
	username: varchar({ length: 100 }),
	roleId: integer("role_id"),
	isActive: boolean("is_active").default(true),
	isEmailVerified: boolean("is_email_verified").default(false),
	emailVerificationToken: varchar("email_verification_token", { length: 255 }),
	passwordResetToken: varchar("password_reset_token", { length: 255 }),
	passwordResetExpires: timestamp("password_reset_expires", { mode: 'string' }),
	mfaEnabled: boolean("mfa_enabled").default(false),
	mfaSecret: text("mfa_secret"),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	profilePicture: varchar("profile_picture", { length: 500 }),
	bio: text(),
	preferences: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	organizationId: integer("organization_id"),
	createdBy: varchar("created_by", { length: 100 }),
	updatedBy: varchar("updated_by", { length: 100 }),
	organizationName: varchar("organization_name", { length: 100 }),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_username_unique").on(table.username),
]);

export const bluetideTelemetry = pgTable("bluetide_telemetry", {
	id: serial().primaryKey().notNull(),
	accountNumber: text("account_number").notNull(),
	deviceId: text("device_id").notNull(),
	timestamp: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	downlinkThroughputMbps: real("downlink_throughput_mbps"),
	uplinkThroughputMbps: real("uplink_throughput_mbps"),
	pingDropRateAvg: real("ping_drop_rate_avg"),
	pingLatencyMsAvg: integer("ping_latency_ms_avg"),
	obstructionPercentTime: real("obstruction_percent_time"),
	uptimeSeconds: integer("uptime_seconds"),
	signalQualityPercent: real("signal_quality_percent"),
	h3CellId: text("h3_cell_id"),
	latitude: doublePrecision(),
	longitude: doublePrecision(),
	secondsUntilSwupdateRebootPossible: integer("seconds_until_swupdate_reboot_possible"),
	runningSoftwareVersion: text("running_software_version"),
	activeAlertCount: integer("active_alert_count"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("bluetide_telemetry_device_timestamp_unique").using("btree", table.deviceId.asc().nullsLast().op("text_ops"), table.timestamp.asc().nullsLast().op("text_ops")),
	index("idx_bluetide_telemetry_account").using("btree", table.accountNumber.asc().nullsLast().op("text_ops")),
	index("idx_bluetide_telemetry_device_id").using("btree", table.deviceId.asc().nullsLast().op("text_ops")),
	index("idx_bluetide_telemetry_device_timestamp").using("btree", table.deviceId.asc().nullsLast().op("text_ops"), table.timestamp.desc().nullsFirst().op("text_ops")),
	index("idx_bluetide_telemetry_location").using("gist", sql`ll_to_earth(latitude, longitude)`),
	index("idx_bluetide_telemetry_timestamp").using("btree", table.timestamp.asc().nullsLast().op("timestamptz_ops")),
]);

export const bluetideUsage = pgTable("bluetide_usage", {
	id: serial().primaryKey().notNull(),
	date: text().notNull(),
	kitp: text().notNull(),
	name: text(),
	usageGb: real("usage_gb"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const mikrotikVessels = pgTable("mikrotik_vessels", {
	id: serial().primaryKey().notNull(),
	vesselName: text("vessel_name").notNull(),
	routerIp: text("router_ip"),
	apiPort: integer("api_port"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("mikrotik_vessels_name_ip_port_unique").on(table.vesselName, table.routerIp, table.apiPort),
]);

export const sessions = pgTable("sessions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	currentDb: varchar("current_db", { length: 100 }),
	sessionData: jsonb("session_data"),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	isActive: boolean("is_active").default(true),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	token: varchar({ length: 255 }),
});

export const telephonyDids = pgTable("telephony_dids", {
	id: serial().primaryKey().notNull(),
	number: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	channelsIncluded: integer("channels_included"),
	dedicatedChannels: integer("dedicated_channels"),
	channelsIncludedCount: integer("channels_included_count"),
	dedicatedChannelsCount: integer("dedicated_channels_count"),
	blocked: boolean().default(false),
	terminated: boolean().default(false),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("telephony_dids_number_unique").on(table.number),
]);

export const userRoles = pgTable("user_roles", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	displayName: varchar("display_name", { length: 200 }),
	description: text(),
	permissions: jsonb().default([]),
	isActive: boolean("is_active").default(true),
	isSystem: boolean("is_system").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 100 }),
	organizationName: varchar("organization_name", { length: 100 }),
	permittedVesselGroups: integer("permitted_vessel_groups").array().default(sql`ARRAY[]::integer[]`).notNull(),
}, (table) => [
	unique("user_roles_name_unique").on(table.name),
]);

export const vesselGroups = pgTable("vessel_groups", {
	id: serial().primaryKey().notNull(),
	groupName: text("group_name").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("vessel_groups_group_name_unique").on(table.groupName),
]);

export const vessels = pgTable("vessels", {
	id: serial().primaryKey().notNull(),
	vesselskitNumber: text("vesselskit_number").notNull(),
	name: text(),
	subscriptionPlan: text("subscription_plan"),
	groupId: integer("group_id"),
	deviceId: text("device_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [vesselGroups.id],
			name: "vessels_group_id_vessel_groups_id_fk"
		}),
	unique("vessels_vesselskit_number_unique").on(table.vesselskitNumber),
]);

export const organizations = pgTable("organizations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	logo: text(),
	subscriptionId: text("subscription_id"),
	parentOrgName: text("parent_org_name"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.parentOrgName],
			foreignColumns: [table.name],
			name: "organizations_parent_org_name_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	unique("organizations_name_key").on(table.name),
]);

export const syncState = pgTable("sync_state", {
	id: serial().primaryKey().notNull(),
	source: text().notNull(),
	partitionKey: text("partition_key").default('default').notNull(),
	cursorType: text("cursor_type").default('timestamp').notNull(),
	cursorValue: text("cursor_value"),
	lastSyncedAt: timestamp("last_synced_at", { withTimezone: true, mode: 'string' }),
	meta: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("sync_state_source_partition_unique").using("btree", table.source.asc().nullsLast().op("text_ops"), table.partitionKey.asc().nullsLast().op("text_ops")),
]);

export const pins = pgTable("pins", {
	id: serial().notNull(),
	vesselId: integer("vessel_id").notNull(),
	kitp: text().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	generatedBy: integer("generated_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const permissions = pgTable("permissions", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	resource: varchar({ length: 255 }).notNull(),
	action: varchar({ length: 100 }).notNull(),
	scope: permissionScope().default('own'),
	category: permissionCategory().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("permissions_name_unique").on(table.name),
]);

export const rolesPermission = pgTable("roles_permission", {
	id: serial().primaryKey().notNull(),
	roleId: integer().notNull(),
	apiPermissions: text("api_permissions"),
	componentPermissions: text("component_permissions"),
	navigationPermissions: text("navigation_permissions"),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("roles_permission_roleId_unique").on(table.roleId),
]);

export const starlinkUsage = pgTable("starlink_usage", {
	id: serial().notNull(),
	dateKey: text("date_key").notNull(),
	kitNumber: text("kit_number").notNull(),
	vesselName: text("vessel_name"),
	mobilePriorityGb: real("mobile_priority_gb"),
	standardGb: real("standard_gb"),
	chargebeeSubscriptionId: text("chargebee_subscription_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	usageLimitGb: real("usage_limit_gb"),
	publicIpEnabled: boolean("public_ip_enabled"),
}, (table) => [
	primaryKey({ columns: [table.dateKey, table.kitNumber], name: "starlink_usage_date_key_kit_number_pk"}),
]);
export const starlinkUsageStatsMv = pgMaterializedView("starlink_usage_stats_mv", {	kitNumber: text("kit_number"),
	vesselName: text("vessel_name"),
	last60DaysUsageGb: real("last_60_days_usage_gb"),
	last30DaysUsageGb: real("last_30_days_usage_gb"),
	last7DaysUsageGb: real("last_7_days_usage_gb"),
	lifetimeUsageGb: real("lifetime_usage_gb"),
	firstUsageDate: date("first_usage_date"),
	lastUsageDate: date("last_usage_date"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalDaysWithUsage: bigint("total_days_with_usage", { mode: "number" }),
	last60DaysBreakdown: jsonb("last_60_days_breakdown"),
	avgDailyUsageLast60Days: doublePrecision("avg_daily_usage_last_60_days"),
	avgDailyUsageLast30Days: doublePrecision("avg_daily_usage_last_30_days"),
	currentUsageLimit: real("current_usage_limit"),
	currentPublicIpEnabled: boolean("current_public_ip_enabled"),
	currentSubscriptionId: text("current_subscription_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	systemTotalVessels: bigint("system_total_vessels", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	systemTotalVesselGroups: bigint("system_total_vessel_groups", { mode: "number" }),
	systemTotalLifetimeUsageGb: real("system_total_lifetime_usage_gb"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	systemTotalActiveKits: bigint("system_total_active_kits", { mode: "number" }),
	lastUpdated: timestamp("last_updated", { withTimezone: true, mode: 'string' }),
}).as(sql`WITH last_60_days AS ( SELECT starlink_usage.kit_number, starlink_usage.vessel_name, to_date(starlink_usage.date_key, 'YYYYMMDD'::text) AS usage_date, starlink_usage.mobile_priority_gb, starlink_usage.standard_gb, COALESCE(starlink_usage.mobile_priority_gb, 0::real) + COALESCE(starlink_usage.standard_gb, 0::real) AS total_gb, starlink_usage.usage_limit_gb, starlink_usage.public_ip_enabled, starlink_usage.chargebee_subscription_id FROM starlink_usage WHERE to_date(starlink_usage.date_key, 'YYYYMMDD'::text) >= (CURRENT_DATE - '60 days'::interval) ORDER BY starlink_usage.date_key ), last_30_days AS ( SELECT starlink_usage.kit_number, COALESCE(starlink_usage.mobile_priority_gb, 0::real) + COALESCE(starlink_usage.standard_gb, 0::real) AS total_gb FROM starlink_usage WHERE to_date(starlink_usage.date_key, 'YYYYMMDD'::text) >= (CURRENT_DATE - '30 days'::interval) ), last_7_days AS ( SELECT starlink_usage.kit_number, COALESCE(starlink_usage.mobile_priority_gb, 0::real) + COALESCE(starlink_usage.standard_gb, 0::real) AS total_gb FROM starlink_usage WHERE to_date(starlink_usage.date_key, 'YYYYMMDD'::text) >= (CURRENT_DATE - '7 days'::interval) ), lifetime_usage AS ( SELECT starlink_usage.kit_number, sum(COALESCE(starlink_usage.mobile_priority_gb, 0::real) + COALESCE(starlink_usage.standard_gb, 0::real)) AS lifetime_usage_gb, min(to_date(starlink_usage.date_key, 'YYYYMMDD'::text)) AS first_usage_date, max(to_date(starlink_usage.date_key, 'YYYYMMDD'::text)) AS last_usage_date, count(DISTINCT starlink_usage.date_key) AS total_days_with_usage FROM starlink_usage GROUP BY starlink_usage.kit_number ), system_stats AS ( SELECT count(DISTINCT v.vesselskit_number) AS total_vessels, count(DISTINCT vg.id) AS total_vessel_groups, sum(COALESCE(su.mobile_priority_gb, 0::real) + COALESCE(su.standard_gb, 0::real)) AS total_lifetime_usage_gb, count(DISTINCT su.kit_number) AS total_active_kits FROM starlink_usage su LEFT JOIN vessels v ON v.vesselskit_number = su.kit_number LEFT JOIN vessel_groups vg ON vg.id = v.group_id ) SELECT COALESCE(l60.kit_number, lt.kit_number) AS kit_number, max(l60.vessel_name) AS vessel_name, COALESCE(sum(l60.total_gb), 0::real) AS last_60_days_usage_gb, COALESCE(sum(l30.total_gb), 0::real) AS last_30_days_usage_gb, COALESCE(sum(l7.total_gb), 0::real) AS last_7_days_usage_gb, COALESCE(max(lt.lifetime_usage_gb), 0::real) AS lifetime_usage_gb, max(lt.first_usage_date) AS first_usage_date, max(lt.last_usage_date) AS last_usage_date, max(lt.total_days_with_usage) AS total_days_with_usage, jsonb_agg( CASE WHEN l60.usage_date IS NOT NULL THEN jsonb_build_object('date', l60.usage_date, 'mobilePriorityGb', COALESCE(l60.mobile_priority_gb, 0::real), 'standardGb', COALESCE(l60.standard_gb, 0::real), 'totalGb', l60.total_gb, 'usageLimitGB', l60.usage_limit_gb, 'publicIP_Enabled', l60.public_ip_enabled, 'chargebeeSubscriptionId', l60.chargebee_subscription_id) ELSE NULL::jsonb END ORDER BY l60.usage_date) FILTER (WHERE l60.usage_date IS NOT NULL) AS last_60_days_breakdown, CASE WHEN count(l60.usage_date) > 0 THEN COALESCE(sum(l60.total_gb), 0::real) / count(l60.usage_date)::double precision ELSE 0::double precision END AS avg_daily_usage_last_60_days, CASE WHEN count(l30.total_gb) > 0 THEN COALESCE(sum(l30.total_gb), 0::real) / count(l30.total_gb)::double precision ELSE 0::double precision END AS avg_daily_usage_last_30_days, max(l60.usage_limit_gb) AS current_usage_limit, bool_or(l60.public_ip_enabled) AS current_public_ip_enabled, max(l60.chargebee_subscription_id) AS current_subscription_id, max(ss.total_vessels) AS system_total_vessels, max(ss.total_vessel_groups) AS system_total_vessel_groups, max(ss.total_lifetime_usage_gb) AS system_total_lifetime_usage_gb, max(ss.total_active_kits) AS system_total_active_kits, now() AS last_updated FROM ( SELECT NULL::text AS "?column?") dummy LEFT JOIN last_60_days l60 ON true LEFT JOIN last_30_days l30 ON l30.kit_number = l60.kit_number LEFT JOIN last_7_days l7 ON l7.kit_number = l60.kit_number LEFT JOIN lifetime_usage lt ON lt.kit_number = l60.kit_number CROSS JOIN system_stats ss GROUP BY (COALESCE(l60.kit_number, lt.kit_number)) HAVING COALESCE(l60.kit_number, lt.kit_number) IS NOT NULL`);

export const starlinkSystemSummaryMv = pgMaterializedView("starlink_system_summary_mv", {	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalVessels: bigint("total_vessels", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalVesselGroups: bigint("total_vessel_groups", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalActiveKits: bigint("total_active_kits", { mode: "number" }),
	totalLifetimeUsageGb: real("total_lifetime_usage_gb"),
	totalLast60DaysUsageGb: real("total_last_60_days_usage_gb"),
	totalLast30DaysUsageGb: real("total_last_30_days_usage_gb"),
	totalLast7DaysUsageGb: real("total_last_7_days_usage_gb"),
	earliestUsageDate: date("earliest_usage_date"),
	latestUsageDate: date("latest_usage_date"),
	avgUsagePerKit: doublePrecision("avg_usage_per_kit"),
	avgDailySystemUsage: doublePrecision("avg_daily_system_usage"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	kitsWithPublicIpEnabled: bigint("kits_with_public_ip_enabled", { mode: "number" }),
	lastUpdated: timestamp("last_updated", { withTimezone: true, mode: 'string' }),
}).as(sql`SELECT count(DISTINCT v.vesselskit_number) AS total_vessels, count(DISTINCT vg.id) AS total_vessel_groups, count(DISTINCT su.kit_number) AS total_active_kits, sum(COALESCE(su.mobile_priority_gb, 0::real) + COALESCE(su.standard_gb, 0::real)) AS total_lifetime_usage_gb, sum( CASE WHEN to_date(su.date_key, 'YYYYMMDD'::text) >= (CURRENT_DATE - '60 days'::interval) THEN COALESCE(su.mobile_priority_gb, 0::real) + COALESCE(su.standard_gb, 0::real) ELSE 0::real END) AS total_last_60_days_usage_gb, sum( CASE WHEN to_date(su.date_key, 'YYYYMMDD'::text) >= (CURRENT_DATE - '30 days'::interval) THEN COALESCE(su.mobile_priority_gb, 0::real) + COALESCE(su.standard_gb, 0::real) ELSE 0::real END) AS total_last_30_days_usage_gb, sum( CASE WHEN to_date(su.date_key, 'YYYYMMDD'::text) >= (CURRENT_DATE - '7 days'::interval) THEN COALESCE(su.mobile_priority_gb, 0::real) + COALESCE(su.standard_gb, 0::real) ELSE 0::real END) AS total_last_7_days_usage_gb, min(to_date(su.date_key, 'YYYYMMDD'::text)) AS earliest_usage_date, max(to_date(su.date_key, 'YYYYMMDD'::text)) AS latest_usage_date, CASE WHEN count(DISTINCT su.kit_number) > 0 THEN sum(COALESCE(su.mobile_priority_gb, 0::real) + COALESCE(su.standard_gb, 0::real)) / count(DISTINCT su.kit_number)::double precision ELSE 0::double precision END AS avg_usage_per_kit, CASE WHEN count(DISTINCT su.date_key) > 0 THEN sum(COALESCE(su.mobile_priority_gb, 0::real) + COALESCE(su.standard_gb, 0::real)) / count(DISTINCT su.date_key)::double precision ELSE 0::double precision END AS avg_daily_system_usage, count(DISTINCT CASE WHEN su.public_ip_enabled = true THEN su.kit_number ELSE NULL::text END) AS kits_with_public_ip_enabled, now() AS last_updated FROM starlink_usage su LEFT JOIN vessels v ON v.vesselskit_number = su.kit_number LEFT JOIN vessel_groups vg ON vg.id = v.group_id`);