ALTER TABLE "hr_policy_configs" DROP CONSTRAINT IF EXISTS "hr_policy_configs_organization_id_key";--> statement-breakpoint
ALTER TABLE "hr_policy_configs" DROP CONSTRAINT IF EXISTS "hr_policy_configs_org_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "hr_policy_configs_org_policy_name_unique"
ON "hr_policy_configs" ("organization_id","policy_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "hr_policy_configs_one_applied_per_org"
ON "hr_policy_configs" ("organization_id")
WHERE "is_applied" = true;
