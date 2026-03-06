CREATE TABLE IF NOT EXISTS "hr_shift_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" integer NOT NULL,
  "shift_id" integer NOT NULL,
  "employee_profile_id" integer NOT NULL,
  "actor_user_id" integer NOT NULL,
  "event_type" varchar(40) NOT NULL,
  "event_at" timestamp NOT NULL DEFAULT now(),
  "source" varchar(30) NOT NULL DEFAULT 'API',
  "payload" jsonb,
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "hr_shift_events_shift_event_idx"
  ON "hr_shift_events" ("shift_id", "event_at");

CREATE INDEX IF NOT EXISTS "hr_shift_events_employee_event_idx"
  ON "hr_shift_events" ("organization_id", "employee_profile_id", "event_at");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_shift_events_organization_fk') THEN
    ALTER TABLE "hr_shift_events"
      ADD CONSTRAINT "hr_shift_events_organization_fk"
      FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_shift_events_shift_fk') THEN
    ALTER TABLE "hr_shift_events"
      ADD CONSTRAINT "hr_shift_events_shift_fk"
      FOREIGN KEY ("shift_id") REFERENCES "hr_shifts"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_shift_events_employee_fk') THEN
    ALTER TABLE "hr_shift_events"
      ADD CONSTRAINT "hr_shift_events_employee_fk"
      FOREIGN KEY ("employee_profile_id") REFERENCES "hr_employee_profiles"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_shift_events_actor_user_fk') THEN
    ALTER TABLE "hr_shift_events"
      ADD CONSTRAINT "hr_shift_events_actor_user_fk"
      FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;
  END IF;
END $$;
