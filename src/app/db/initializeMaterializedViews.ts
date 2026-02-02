import { createStarlinkUsageViews, refreshStarlinkUsageViews } from '../utils/refreshMaterializedViews';

/**
 * Initialize materialized views for the application
 * This should be run after database migrations and initial data seeding
 */
export async function initializeMaterializedViews(): Promise<void> {
  try {
    console.log('Initializing materialized views...');

    // Create the materialized views (this will drop and recreate them)
    await createStarlinkUsageViews();

    // Refresh the views with existing data to populate them immediately
    console.log('Populating materialized views with existing data...');
    await refreshStarlinkUsageViews();

    console.log('Materialized views initialized and populated successfully');
  } catch (error) {
    console.error('Error initializing materialized views:', error);
    throw error;
  }
}