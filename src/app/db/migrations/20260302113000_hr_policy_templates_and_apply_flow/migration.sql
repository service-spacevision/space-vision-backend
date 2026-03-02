ALTER TABLE "hr_policy_configs" ADD COLUMN IF NOT EXISTS "policy_name" varchar(120) DEFAULT 'Default Policy' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_policy_configs" ADD COLUMN IF NOT EXISTS "is_applied" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_policy_configs" ADD COLUMN IF NOT EXISTS "applied_at" timestamp;--> statement-breakpoint
ALTER TABLE "hr_policy_configs" DROP CONSTRAINT IF EXISTS "hr_policy_configs_org_unique";--> statement-breakpoint
UPDATE "hr_policy_configs"
SET "is_applied" = true,
    "applied_at" = COALESCE("applied_at", now())
WHERE "is_applied" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "hr_policy_configs_one_applied_per_org"
ON "hr_policy_configs" ("organization_id")
WHERE "is_applied" = true;
