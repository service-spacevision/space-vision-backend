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
    
    // Drop existing views if they exist (for development/migration purposes)
    await db.execute(DROP_STARLINK_USAGE_STATS_MV);
    await db.execute(DROP_STARLINK_SYSTEM_SUMMARY_MV);
    
    // Create the main stats materialized view
    await db.execute(CREATE_STARLINK_USAGE_STATS_MV);
    
    // Create the system summary materialized view
    await db.execute(CREATE_STARLINK_SYSTEM_SUMMARY_MV);
    
    // Create indexes for better performance
    for (const indexSql of CREATE_STARLINK_USAGE_STATS_INDEXES) {
      await db.execute(indexSql);
    }
    
    console.log('✓ Created starlink_usage_stats_mv');
    console.log('✓ Created starlink_system_summary_mv');
    console.log('✓ Created indexes');
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