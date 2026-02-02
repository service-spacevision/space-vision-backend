-- Migration: Update sessions table token column from varchar(255) to text
-- This fixes the issue where JWT tokens exceed the 255 character limit

ALTER TABLE sessions ALTER COLUMN token TYPE text;