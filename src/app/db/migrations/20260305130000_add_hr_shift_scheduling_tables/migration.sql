CREATE TABLE IF NOT EXISTS "hr_shift_groups" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" integer NOT NULL,
  "name" varchar(120) NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'hr_shift_groups_org_name_unique'
  ) THEN
    ALTER TABLE "hr_shift_groups"
      ADD CONSTRAINT "hr_shift_groups_org_name_unique"
      UNIQUE ("organization_id", "name");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "hr_shift_group_members" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" integer NOT NULL,
  "shift_group_id" integer NOT NULL,
  "employee_profile_id" integer NOT NULL,
  "added_at" timestamp DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'hr_shift_group_members_unique'
  ) THEN
    ALTER TABLE "hr_shift_group_members"
      ADD CONSTRAINT "hr_shift_group_members_unique"
      UNIQUE ("shift_group_id", "employee_profile_id");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "hr_shift_layouts" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" integer NOT NULL,
  "shift_group_id" integer NOT NULL,
  "name" varchar(120) NOT NULL,
  "timezone" varchar(80) NOT NULL DEFAULT 'UTC',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_by_user_id" integer NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'hr_shift_layouts_org_group_name_unique'
  ) THEN
    ALTER TABLE "hr_shift_layouts"
      ADD CONSTRAINT "hr_shift_layouts_org_group_name_unique"
      UNIQUE ("organization_id", "shift_group_id", "name");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "hr_shift_layout_rules" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" integer NOT NULL,
  "layout_id" integer NOT NULL,
  "day_of_week" integer NOT NULL,
  "start_time" varchar(5) NOT NULL,
  "end_time" varchar(5) NOT NULL,
  "is_off_day" boolean NOT NULL DEFAULT false
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'hr_shift_layout_rules_layout_day_unique'
  ) THEN
    ALTER TABLE "hr_shift_layout_rules"
      ADD CONSTRAINT "hr_shift_layout_rules_layout_day_unique"
      UNIQUE ("layout_id", "day_of_week");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "hr_shifts" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" integer NOT NULL,
  "employee_profile_id" integer NOT NULL,
  "shift_group_id" integer,
  "layout_id" integer,
  "layout_rule_id" integer,
  "shift_start_at" timestamp NOT NULL,
  "shift_end_at" timestamp NOT NULL,
  "source" varchar(20) NOT NULL DEFAULT 'MANUAL',
  "status" varchar(20) NOT NULL DEFAULT 'SCHEDULED',
  "notes" text,
  "created_by_user_id" integer NOT NULL,
  "updated_by_user_id" integer,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "hr_shifts_employee_start_idx"
  ON "hr_shifts" ("organization_id", "employee_profile_id", "shift_start_at");
CREATE INDEX IF NOT EXISTS "hr_shifts_group_start_idx"
  ON "hr_shifts" ("organization_id", "shift_group_id", "shift_start_at");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_shift_group_members_group_fk') THEN
    ALTER TABLE "hr_shift_group_members"
      ADD CONSTRAINT "hr_shift_group_members_group_fk"
      FOREIGN KEY ("shift_group_id") REFERENCES "hr_shift_groups"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_shift_group_members_employee_fk') THEN
    ALTER TABLE "hr_shift_group_members"
      ADD CONSTRAINT "hr_shift_group_members_employee_fk"
      FOREIGN KEY ("employee_profile_id") REFERENCES "hr_employee_profiles"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_shift_layouts_group_fk') THEN
    ALTER TABLE "hr_shift_layouts"
      ADD CONSTRAINT "hr_shift_layouts_group_fk"
      FOREIGN KEY ("shift_group_id") REFERENCES "hr_shift_groups"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_shift_layout_rules_layout_fk') THEN
    ALTER TABLE "hr_shift_layout_rules"
      ADD CONSTRAINT "hr_shift_layout_rules_layout_fk"
      FOREIGN KEY ("layout_id") REFERENCES "hr_shift_layouts"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_shifts_employee_fk') THEN
    ALTER TABLE "hr_shifts"
      ADD CONSTRAINT "hr_shifts_employee_fk"
      FOREIGN KEY ("employee_profile_id") REFERENCES "hr_employee_profiles"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_shifts_group_fk') THEN
    ALTER TABLE "hr_shifts"
      ADD CONSTRAINT "hr_shifts_group_fk"
      FOREIGN KEY ("shift_group_id") REFERENCES "hr_shift_groups"("id") ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_shifts_layout_fk') THEN
    ALTER TABLE "hr_shifts"
      ADD CONSTRAINT "hr_shifts_layout_fk"
      FOREIGN KEY ("layout_id") REFERENCES "hr_shift_layouts"("id") ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_shifts_layout_rule_fk') THEN
    ALTER TABLE "hr_shifts"
      ADD CONSTRAINT "hr_shifts_layout_rule_fk"
      FOREIGN KEY ("layout_rule_id") REFERENCES "hr_shift_layout_rules"("id") ON DELETE SET NULL;
  END IF;
END $$;
