import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrEmployeeProfiles } from '../../../models/HrEmployeeProfile'
import { hrShiftGroupMembers } from '../../../models/HrShiftGroupMember'
import { ReqObjectType } from '../../../utils/types'
import { getShiftGroup } from './_helpers'

interface Params {
  reqObject: ReqObjectType
  data: {
    shiftGroupId: number
    employeeProfileIds: number[]
  }
}

export async function addHrShiftGroupMembers_func({ reqObject, data }: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const group = await getShiftGroup(orgId, Number(data.shiftGroupId))
    if (!group) return { success: false, message: 'Shift group not found' }

    const uniqueIds = Array.from(new Set((data.employeeProfileIds || []).map((v) => Number(v)).filter((v) => Number.isInteger(v) && v > 0)))
    if (!uniqueIds.length) {
      return { success: false, message: 'At least one valid employee profile ID is required' }
    }

    const existingProfiles = await db
      .select({ id: hrEmployeeProfiles.id })
      .from(hrEmployeeProfiles)
      .where(
        and(
          eq(hrEmployeeProfiles.organizationId, orgId),
          inArray(hrEmployeeProfiles.id, uniqueIds),
        ),
      )
    const profileSet = new Set(existingProfiles.map((p) => Number(p.id)))
    const missing = uniqueIds.filter((id) => !profileSet.has(id))
    if (missing.length > 0) {
      return { success: false, message: `Invalid employeeProfileIds for this organization: ${missing.join(', ')}` }
    }

    const inserted: number[] = []
    for (const employeeProfileId of uniqueIds) {
      const [row] = await db
        .insert(hrShiftGroupMembers)
        .values({
          organizationId: orgId,
          shiftGroupId: Number(data.shiftGroupId),
          employeeProfileId,
        })
        .onConflictDoNothing()
        .returning({ id: hrShiftGroupMembers.id })
      if (row?.id) inserted.push(Number(employeeProfileId))
    }

    return {
      success: true,
      message: 'Shift group members updated successfully',
      data: {
        shiftGroupId: Number(data.shiftGroupId),
        addedEmployeeProfileIds: inserted,
      },
    }
  } catch (error: any) {
    console.error('Error adding shift group members:', error)
    return { success: false, message: 'Failed to add shift group members', error: error?.message }
  }
}

