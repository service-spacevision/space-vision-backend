CREATE TABLE "bluetide_usage" (
	"date" text,
	"kitp" text,
	"name" text,
	"usage_gb" real,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bluetide_usage_date_kitp_pk" PRIMARY KEY("date","kitp")
);
--> statement-breakpoint
CREATE TABLE "group_access" (
	"role" text,
	"group_name" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "group_access_role_group_name_pk" PRIMARY KEY("role","group_name")
);
--> statement-breakpoint
CREATE TABLE "mikrotik_vessels" (
	"vessel_name" text PRIMARY KEY NOT NULL,
	"router_ip" text,
	"api_port" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "starlink_usage" (
	"date_key" text,
	"kit_number" text,
	"vessel_name" text,
	"mobile_priority_gb" real,
	"standard_gb" real,
	"chargebee_subscription_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "starlink_usage_date_key_kit_number_pk" PRIMARY KEY("date_key","kit_number")
);
--> statement-breakpoint
CREATE TABLE "telephony_dids" (
	"number" text PRIMARY KEY NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"channels_included_count" integer,
	"dedicated_channels_count" integer,
	"blocked" boolean DEFAULT false,
	"terminated" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vessel_groups" (
	"group_name" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vessels" (
	"vesselskit_number" text PRIMARY KEY NOT NULL,
	"name" text,
	"subscription_plan" text,
	"group_name" text,
	"device_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
