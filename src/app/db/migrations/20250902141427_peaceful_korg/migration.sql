ALTER TABLE "telephony_dids" ADD COLUMN IF NOT EXISTS "channels_included" integer;--> statement-breakpoint
ALTER TABLE "telephony_dids" ADD COLUMN IF NOT EXISTS "dedicated_channels" integer;