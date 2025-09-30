import { db } from '../../../db/connection';
import { organizations } from '../../../models/Organization';
import { eq, or } from 'drizzle-orm';

interface Params {
  name?: string; // Make name optional
  id?: number;
}

export async function getOrganizationByName_func({ name, id }: Params) {
  try {
    if (!name && !id) {
      return {
        success: false,
        message: 'Either name or id must be provided',
      };
    }

    const conditions = [];
    if (name && name.trim() !== '')
      conditions.push(eq(organizations.name, name));
    if (id) conditions.push(eq(organizations.id, id));

    const [row] = await db
      .select()
      .from(organizations)
      .where(conditions.length > 1 ? or(...conditions) : conditions[0]);

    if (!row) {
      return {
        success: false,
        message: 'Organization not found',
        data: null,
      };
    }

    // Ensure all required fields are present and properly formatted
    const responseData = {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      logo: row.logo || undefined,
      subscription_id: row.subscription_id || undefined,
      parent_org_name: row.parent_org_name || undefined,
      permittedVesselGroups: row.permittedVesselGroups || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return {
      success: true,
      message: 'Organization retrieved successfully',
      data: responseData,
    };
  } catch (error) {
    console.error('Error fetching organization:', error);
    return {
      success: false,
      message: 'Failed to fetch organization',
    };
  }
}
