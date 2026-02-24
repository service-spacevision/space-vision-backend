CREATE TABLE IF NOT EXISTS "pins" (
	"id" serial NOT NULL,
	"vessel_id" integer NOT NULL,
	"kitp" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"generated_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
