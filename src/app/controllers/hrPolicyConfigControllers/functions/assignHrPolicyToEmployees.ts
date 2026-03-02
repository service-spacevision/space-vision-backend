import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrEmployeeProfiles } from '../../../models/HrEmployeeProfile'
import { hrPolicyConfigs } from '../../../models/HrPolicyConfig'
import { userRoles } from '../../../models/UserRole'
import { users } from '../../../models/User'
import { ReqObjectType } from '../../../utils/types'

interface Params {
  reqObject: ReqObjectType
  data: {
    policyId: number
    employeeProfileIds?: number[]
    roleId?: number
  }
}

export async function assignHrPolicyToEmployees_func({ reqObject, data }: Params) {
  try {
    const organizationId = Number(reqObject.user.organizationId)
    const actorUserId = Number(reqObject.user.id)

    if (!organizationId) {
      return { success: false, message: 'Organization not found for user' }
    }

    const explicitProfileIds = Array.from(
      new Set((data.employeeProfileIds || []).map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)),
    )
    const roleId = data.roleId ? Number(data.roleId) : null
    const targetProfileIdSet = new Set<number>(explicitProfileIds)

    const [policy] = await db
      .select({ id: hrPolicyConfigs.id, organizationId: hrPolicyConfigs.organizationId })
      .from(hrPolicyConfigs)
      .where(eq(hrPolicyConfigs.id, Number(data.policyId)))
      .limit(1)

    if (!policy) {
      return { success: false, message: 'Policy not found' }
    }

    if (Number(policy.organizationId) !== organizationId) {
      return {
        success: false,
        message: 'Policy does not belong to this organization',
      }
    }

    if (roleId) {
      const [role] = await db
        .select({ id: userRoles.id, organizationId: userRoles.organizationId })
        .from(userRoles)
        .where(eq(userRoles.id, roleId))
        .limit(1)

      if (!role) {
        return { success: false, message: 'Role not found' }
      }

      if (role.organizationId && Number(role.organizationId) !== organizationId) {
        return {
          success: false,
          message: 'Role does not belong to this organization',
        }
      }

      const roleProfileRows = await db
        .select({ id: hrEmployeeProfiles.id })
        .from(hrEmployeeProfiles)
        .innerJoin(users, eq(users.id, hrEmployeeProfiles.userId))
        .where(
          and(
            eq(hrEmployeeProfiles.organizationId, organizationId),
            eq(users.organizationId, organizationId),
            eq(users.roleId, roleId),
          ),
        )

      for (const row of roleProfileRows) {
        targetProfileIdSet.add(Number(row.id))
      }
    }

    const targetProfileIds = Array.from(targetProfileIdSet)
    if (!targetProfileIds.length) {
      return {
        success: false,
        message: 'Provide employeeProfileIds or roleId with at least one matched employee profile',
      }
    }

    const existingProfiles = await db
      .select({ id: hrEmployeeProfiles.id })
      .from(hrEmployeeProfiles)
      .where(
        and(
          eq(hrEmployeeProfiles.organizationId, organizationId),
          inArray(hrEmployeeProfiles.id, targetProfileIds),
        ),
      )

    const existingIdSet = new Set(existingProfiles.map((row) => Number(row.id)))
    const missingIds = targetProfileIds.filter((id) => !existingIdSet.has(id))
    if (missingIds.length > 0) {
      return {
        success: false,
        message: `Some employee profiles were not found in your organization: ${missingIds.join(', ')}`,
      }
    }

    const updated = await db
      .update(hrEmployeeProfiles)
      .set({
        policyId: Number(data.policyId),
        policyAssignedAt: new Date(),
        policyAssignedByUserId: actorUserId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(hrEmployeeProfiles.organizationId, organizationId),
          inArray(hrEmployeeProfiles.id, targetProfileIds),
        ),
      )
      .returning({ id: hrEmployeeProfiles.id })

    return {
      success: true,
      message: 'Policy assigned to employees successfully',
      data: {
        policyId: Number(data.policyId),
        roleId,
        updatedCount: updated.length,
        employeeProfileIds: updated.map((row) => Number(row.id)),
      },
    }
  } catch (error: any) {
    console.error('Error assigning policy to employees:', error)
    return {
      success: false,
      message: 'Failed to assign policy to employees',
      error: error?.message,
    }
  }
}
