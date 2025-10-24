import { db } from '../db/connection';
import { sql } from 'drizzle-orm';
import {
  CREATE_STARLINK_USAGE_STATS_MV,
  CREATE_STARLINK_SYSTEM_SUMMARY_MV,
  DROP_STARLINK_USAGE_STATS_MV,
  DROP_STARLINK_SYSTEM_SUMMARY_MV,
  REFRESH_STARLINK_USAGE_STATS_MV,
  REFRESH_STARLINK_SYSTEM_SUMMARY_MV,
  CREATE_STARLINK_USAGE_STATS_INDEXES
} from '../models/MaterialViews/StarlinkUsageStats';

/**
 * Refreshes Starlink usage materialized views
 * This should be called after syncing Starlink usage data
 */
export async function refreshStarlinkUsageViews(): Promise<void> {
  try {
    console.log('Refreshing Starlink usage materialized views...');
    
    // Refresh the main stats view
    await db.execute(REFRESH_STARLINK_USAGE_STATS_MV);
    console.log('✓ Refreshed starlink_usage_stats_mv');
    
    // Refresh the system summary view
    await db.execute(REFRESH_STARLINK_SYSTEM_SUMMARY_MV);
    console.log('✓ Refreshed starlink_system_summary_mv');
    
    console.log('All Starlink materialized views refreshed successfully');
  } catch (error) {
    console.error('Error refreshing Starlink materialized views:', error);
    throw error;
  }
}

/**
 * Creates the materialized views if they don't exist
 * This should be run during database initialization
 */
export async function createStarlinkUsageViews(): Promise<void> {
  try {
    console.log('Creating Starlink usage materialized views...');

    // Check if views exist first
    const existingViews = await db.execute(sql`
      SELECT matviewname FROM pg_matviews
      WHERE matviewname IN ('starlink_usage_stats_mv', 'starlink_system_summary_mv')
    `);

    // Drop existing views if they exist (for development/migration purposes)
    if (existingViews.length > 0) {
      console.log('Existing materialized views found, dropping them...');

      // First, try to clean up any potential type conflicts more thoroughly
      try {
        // Drop any dependent objects that might prevent dropping the view
        await db.execute(sql`
          DO $$
          DECLARE
            mv_name text := 'starlink_usage_stats_mv';
          BEGIN
            -- Drop any indexes on the materialized view first
            EXECUTE 'DROP INDEX IF EXISTS idx_starlink_usage_stats_mv_kit_number';
            EXECUTE 'DROP INDEX IF EXISTS idx_starlink_usage_stats_mv_last_updated';

            -- Drop the materialized view (this should cascade to types)
            EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS ' || mv_name || ' CASCADE';

            -- Clean up any orphaned types
            DELETE FROM pg_type WHERE typname = mv_name;
            DELETE FROM pg_class WHERE relname = mv_name;

            EXCEPTION WHEN OTHERS THEN
              RAISE NOTICE 'Error during cleanup of %: %', mv_name, SQLERRM;
          END $$;
        `);
        console.log('✓ Cleaned up starlink_usage_stats_mv and related objects');
      } catch (cleanupError) {
        console.warn('Warning during cleanup:', cleanupError);
      }

      try {
        await db.execute(DROP_STARLINK_SYSTEM_SUMMARY_MV);
        console.log('✓ Dropped starlink_system_summary_mv');
      } catch (dropError) {
        console.warn('Warning: Could not drop starlink_system_summary_mv:', dropError);
      }
    }

    // Create the main stats materialized view
    try {
      await db.execute(CREATE_STARLINK_USAGE_STATS_MV);
      console.log('✓ Created starlink_usage_stats_mv');
    } catch (createError: any) {
      // If the view already exists, that's okay - we tried to drop it first
      if (createError.message && createError.message.includes('already exists')) {
        console.log('✓ starlink_usage_stats_mv already exists');
      } else {
        console.error('Error creating starlink_usage_stats_mv:', createError);
        throw createError;
      }
    }

    // Create the system summary materialized view
    try {
      await db.execute(CREATE_STARLINK_SYSTEM_SUMMARY_MV);
      console.log('✓ Created starlink_system_summary_mv');
    } catch (createError: any) {
      // If the view already exists, that's okay - we tried to drop it first
      if (createError.message && createError.message.includes('already exists')) {
        console.log('✓ starlink_system_summary_mv already exists');
      } else {
        console.error('Error creating starlink_system_summary_mv:', createError);
        throw createError;
      }
    }

    // Create indexes for better performance
    for (const indexSql of CREATE_STARLINK_USAGE_STATS_INDEXES) {
      try {
        await db.execute(indexSql);
        console.log('✓ Created index');
      } catch (indexError) {
        console.warn('Warning: Could not create index:', indexError);
      }
    }

    console.log('All Starlink materialized views created successfully');
  } catch (error) {
    console.error('Error creating Starlink materialized views:', error);
    throw error;
  }
}

/**
 * Drops the materialized views (useful for cleanup or migrations)
 */
export async function dropStarlinkUsageViews(): Promise<void> {
  try {
    console.log('Dropping Starlink usage materialized views...');
    
    await db.execute(DROP_STARLINK_USAGE_STATS_MV);
    await db.execute(DROP_STARLINK_SYSTEM_SUMMARY_MV);
    
    console.log('All Starlink materialized views dropped successfully');
  } catch (error) {
    console.error('Error dropping Starlink materialized views:', error);
    throw error;
  }
}