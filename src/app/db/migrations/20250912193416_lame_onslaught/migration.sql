CREATE TABLE IF NOT EXISTS "bluetide_telemetry" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_number" text NOT NULL,
	"device_id" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"downlink_throughput_mbps" real,
	"uplink_throughput_mbps" real,
	"ping_drop_rate_avg" real,
	"ping_latency_ms_avg" integer,
	"obstruction_percent_time" real,
	"uptime_seconds" integer,
	"signal_quality_percent" real,
	"h3_cell_id" text,
	"latitude" double precision,
	"longitude" double precision,
	"seconds_until_swupdate_reboot_possible" integer,
	"running_software_version" text,
	"active_alert_count" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mikrotik_usage_session" (
	"id" serial PRIMARY KEY NOT NULL,
	"vessel_name" text NOT NULL,
	"username" text NOT NULL,
	"ip" text,
	"mac" text,
	"uptime" text,
	"rx_mb" integer DEFAULT 0 NOT NULL,
	"tx_mb" integer DEFAULT 0 NOT NULL,
	"total_allowed_mb" integer DEFAULT 5000 NOT NULL,
	"percentage_used" numeric(5, 1) DEFAULT '0.0' NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"logo" text,
	"subscription_id" text,
	"parent_org_name" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "organizations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"resource" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"scope" "permission_scope" DEFAULT 'own',
	"category" "permission_category" NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles_permission" (
	"id" serial PRIMARY KEY NOT NULL,
	"roleId" integer NOT NULL,
	"api_permissions" text,
	"component_permissions" text,
	"navigation_permissions" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_permission_roleId_unique" UNIQUE("roleId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"partition_key" text DEFAULT 'default' NOT NULL,
	"cursor_type" text DEFAULT 'timestamp' NOT NULL,
	"cursor_value" text,
	"last_synced_at" timestamp with time zone,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "created_by" varchar(100);
--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "organization_name" varchar(100);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "organization_name" varchar(100);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sync_state_source_partition_unique" ON "sync_state" USING btree ("source","partition_key");
--> statement-breakpoint
ALTER TABLE "user_roles" DROP COLUMN IF EXISTS "permissions";