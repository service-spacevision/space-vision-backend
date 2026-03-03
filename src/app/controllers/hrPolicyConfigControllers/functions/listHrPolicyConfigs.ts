import { and, count, desc, eq, ilike } from 'drizzle-orm';
import { db } from '../../../db/connection';
import { hrPolicyConfigs } from '../../../models/HrPolicyConfig';
import { IPagination, ReqObjectType } from '../../../utils/types';
import { hasSystemRole } from '../../../utils/roleHelpers';

interface Params {
  reqObject: ReqObjectType;
  organizationId?: number;
  pagination?: IPagination;
  searchQuery?: string;
}

export async function listHrPolicyConfigs_func({
  reqObject,
  organizationId,
  pagination,
  searchQuery,
}: Params) {
  try {
    const isSystemUser = await hasSystemRole(reqObject.user.id);
    const resolvedOrgId = organizationId
      ? Number(organizationId)
      : isSystemUser
        ? undefined
        : reqObject.user.organizationId
          ? Number(reqObject.user.organizationId)
          : undefined;

    if (!isSystemUser && !resolvedOrgId) {
      return { success: false, message: 'Organization not found for user' };
    }

    const search = (searchQuery || '').trim();
    let filter: any = undefined;
    if (resolvedOrgId && search) {
      filter = and(
        eq(hrPolicyConfigs.organizationId, resolvedOrgId),
        ilike(hrPolicyConfigs.policyName, `%${search}%`),
      );
    } else if (resolvedOrgId) {
      filter = eq(hrPolicyConfigs.organizationId, resolvedOrgId);
    } else if (search) {
      filter = ilike(hrPolicyConfigs.policyName, `%${search}%`);
    }

    const all = pagination?.all === 'true' || pagination?.all === '1';
    if (all) {
      const rows = filter
        ? await db
            .select()
            .from(hrPolicyConfigs)
            .where(filter)
            .orderBy(
              desc(hrPolicyConfigs.isApplied),
              desc(hrPolicyConfigs.updatedAt),
              desc(hrPolicyConfigs.id),
            )
        : await db
            .select()
            .from(hrPolicyConfigs)
            .orderBy(
              desc(hrPolicyConfigs.isApplied),
              desc(hrPolicyConfigs.updatedAt),
              desc(hrPolicyConfigs.id),
            );

      return {
        success: true,
        message:
          rows.length > 0
            ? 'HR policies fetched successfully'
            : 'No HR policies found',
        data: rows,
        pagination: {
          total: rows.length,
          page: 1,
          pageSize: rows.length,
        },
      };
    }

    const page = pagination?.currentPage || 1;
    const pageSize = pagination?.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const rows = filter
      ? await db
          .select()
          .from(hrPolicyConfigs)
          .where(filter)
          .orderBy(
            desc(hrPolicyConfigs.isApplied),
            desc(hrPolicyConfigs.updatedAt),
            desc(hrPolicyConfigs.id),
          )
          .limit(pageSize)
          .offset(offset)
      : await db
          .select()
          .from(hrPolicyConfigs)
          .orderBy(
            desc(hrPolicyConfigs.isApplied),
            desc(hrPolicyConfigs.updatedAt),
            desc(hrPolicyConfigs.id),
          )
          .limit(pageSize)
          .offset(offset);

    const [totalRow] = filter
      ? await db.select({ total: count() }).from(hrPolicyConfigs).where(filter)
      : await db.select({ total: count() }).from(hrPolicyConfigs);

    return {
      success: true,
      message:
        rows.length > 0
          ? 'HR policies fetched successfully'
          : 'No HR policies found',
      data: rows,
      pagination: {
        total: Number(totalRow?.total || 0),
        page,
        pageSize,
      },
    };
  } catch (error: any) {
    console.error('Error fetching HR policies:', error);
    return {
      success: false,
      message: 'Failed to fetch HR policies',
      error: error?.message,
    };
  }
}
