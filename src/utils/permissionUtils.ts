import { and, inArray, SQL } from "drizzle-orm";
// We'll use a type-only import to avoid circular dependencies
import type { vesselGroups } from "../app/models/VesselGroup";

interface User {
  role?: {
    name: string;
    permittedVesselGroups?: number[];
  };
}

/**
 * Creates a SQL condition to filter by permitted vessel groups if user is not an admin
 * @param user The user object containing role and permissions
 * @param vesselGroupColumn The column to filter on (defaults to vesselGroups.id)
 * @returns SQL condition or undefined if no filtering needed
 */
export function createVesselGroupFilter(
  user: User | undefined,
  vesselGroupColumn: any
): SQL | undefined {
  // If user is admin or has no role, return undefined (no filter)
  if (!user?.role || user.role.name === 'admin') {
    return undefined;
  }

  // If user has no permitted vessel groups, return a condition that will return no results
  if (!user.role.permittedVesselGroups?.length) {
    return inArray(vesselGroupColumn, []);
  }

  // Return condition to filter by permitted vessel groups
  return inArray(vesselGroupColumn, user.role.permittedVesselGroups);
}

/**
 * Checks if a user is an admin
 * @param user The user object to check
 * @returns boolean indicating if the user is an admin
 */
export function isAdmin(user: User | undefined): boolean {
  return user?.role?.name === 'admin';
}

/**
 * Creates a WHERE condition that combines existing conditions with vessel group filtering
 * @param user The user object
 * @param existingConditions Existing SQL conditions to combine with
 * @param vesselGroupColumn The column to use for vessel group filtering (defaults to vesselGroups.id)
 * @returns Combined SQL condition or undefined if no conditions
 */
export function withVesselGroupFilter(
  user: User | undefined,
  existingConditions: SQL[] = [],
  vesselGroupColumn: any
): SQL | undefined {
  const vesselGroupCondition = createVesselGroupFilter(user, vesselGroupColumn);
  
  if (vesselGroupCondition) {
    existingConditions.push(vesselGroupCondition);
  }

  return existingConditions.length > 0 ? and(...existingConditions) : undefined;
}
