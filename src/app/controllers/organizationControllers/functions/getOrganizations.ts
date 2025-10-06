import { db } from '../../../db/connection';
import { organizations } from '../../../models/Organization';
import { count, desc, ilike } from 'drizzle-orm';

interface Params {
  pagination?: { currentPage: number; pageSize: number; all?: string };
  search?: string;
}

export async function getOrganizations_func({ pagination, search }: Params) {
  try {
    const page = pagination?.currentPage || 1;
    const size = pagination?.pageSize || 10;
    const all = pagination?.all === 'true';
    const searchQuery = search || '';

    if (all) {
      const rows = await db
        .select()
        .from(organizations)
        .where(ilike(organizations.name, `%${searchQuery}%`))
        .orderBy(desc(organizations.id));
      return {
        success: true,
        data: rows,
        pagination: { total: rows.length, page: 1, pageSize: rows.length },
      };
    }

    const offset = (page - 1) * size;
    const rows = await db
      .select()
      .from(organizations)
      .where(ilike(organizations.name, `%${searchQuery}%`))
      .orderBy(desc(organizations.id))
      .limit(size)
      .offset(offset);
    const [totalRow] = await db.select({ total: count() }).from(organizations);
    return {
      success: true,
      data: rows,
      pagination: { total: Number(totalRow.total), page, pageSize: size },
    };
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return { success: false, message: 'Failed to fetch organizations' };
  }
}
