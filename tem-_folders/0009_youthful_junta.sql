CREATE TABLE "mikrotik_usage_session" (
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
