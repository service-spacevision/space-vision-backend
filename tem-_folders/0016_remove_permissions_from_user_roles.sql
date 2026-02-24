-- Migration: Remove permissions column from user_roles table
-- Permissions are now handled in the separate roles_permission table

ALTER TABLE user_roles DROP COLUMN IF EXISTS permissions;