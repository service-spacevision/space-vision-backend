CREATE TYPE "public"."permission_category" AS ENUM('navigation', 'component', 'api');--> statement-breakpoint
CREATE TYPE "public"."permission_scope" AS ENUM('own', 'organization', 'all');--> statement-breakpoint
CREATE TYPE "public"."permission_section" AS ENUM('admin', 'organization');