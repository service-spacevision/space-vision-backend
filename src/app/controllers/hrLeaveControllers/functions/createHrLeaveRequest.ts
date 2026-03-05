import { and, eq, gte, inArray, lte } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrLeaveApprovals } from '../../../models/HrLeaveApproval'
import { hrLeaveRequests } from '../../../models/HrLeaveRequest'
import { ReqObjectType } from '../../../utils/types'
import {
  diffDaysInclusive,
  ensureLeaveBalance,
  getEffectivePolicy,
  getEmployeeProfileByUserId,
  getLeaveType,
  parseDateOnly,
} from './_helpers'

interface Params {
  reqObject: ReqObjectType
  data: {
    leaveTypeId: number
    startDate: string
    endDate: string
    reason?: string | null
  }
}

export async function createHrLeaveRequest_func({ reqObject, data }: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    const userId = Number(reqObject.user.id)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const employeeProfile = await getEmployeeProfileByUserId(orgId, userId)
    if (!employeeProfile) {
      return { success: false, message: 'HR employee profile not found for user' }
    }

    const leaveTypeId = Number(data.leaveTypeId)
    const leaveType = await getLeaveType(orgId, leaveTypeId)
    if (!leaveType) return { success: false, message: 'Leave type not found' }
    if (leaveType.isEnabled === false) return { success: false, message: 'Leave type is disabled' }

    const startDate = String(data.startDate)
    const endDate = String(data.endDate)
    const start = parseDateOnly(startDate)
    const end = parseDateOnly(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, message: 'Invalid leave dates' }
    }
    if (end < start) {
      return { success: false, message: 'End date must be equal to or after start date' }
    }

    const leaveDays = diffDaysInclusive(startDate, endDate)
    if (leaveDays <= 0) {
      return { success: false, message: 'Invalid leave duration' }
    }

    if (start.getUTCFullYear() !== end.getUTCFullYear()) {
      return {
        success: false,
        message: 'Cross-year leave request is not supported in one request. Please split into separate requests.',
      }
    }

    if (employeeProfile.leaveEligibilityStartAt) {
      const eligibleFrom = new Date(employeeProfile.leaveEligibilityStartAt as any)
      if (start < eligibleFrom) {
        return {
          success: false,
          message: `Employee is not leave-eligible before ${eligibleFrom.toISOString().slice(0, 10)}`,
        }
      }
    }

    const effectivePolicy = await getEffectivePolicy(orgId, employeeProfile.policyId)
    const maxConsecutive = Number(effectivePolicy?.maxConsecutiveLeaveDays || 0)
    if (maxConsecutive > 0 && leaveDays > maxConsecutive) {
      return {
        success: false,
        message: `Requested leave exceeds max consecutive days (${maxConsecutive})`,
      }
    }

    // Policy provides default notice rule; leave type can override it.
    const policyDefaultNoticeDays = Number(effectivePolicy?.casualLeaveNoticeDays || 0)
    const noticeDays =
      leaveType.requiresNoticeDays !== null && leaveType.requiresNoticeDays !== undefined
        ? Number(leaveType.requiresNoticeDays)
        : policyDefaultNoticeDays
    if (Number(noticeDays) > 0) {
      const today = new Date()
      const todayDateOnly = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
      const diff = Math.floor((start.getTime() - todayDateOnly.getTime()) / 86400000)
      if (diff < Number(noticeDays)) {
        return {
          success: false,
          message: `This leave type requires at least ${noticeDays} days notice`,
        }
      }
    }

    const overlapping = await db
      .select({ id: hrLeaveRequests.id })
      .from(hrLeaveRequests)
      .where(
        and(
          eq(hrLeaveRequests.organizationId, orgId),
          eq(hrLeaveRequests.employeeProfileId, Number(employeeProfile.id)),
          inArray(hrLeaveRequests.status, ['PENDING', 'APPROVED']),
          lte(hrLeaveRequests.startDate, endDate as any),
          gte(hrLeaveRequests.endDate, startDate as any),
        ),
      )
      .limit(1)

    if (overlapping.length > 0) {
      return { success: false, message: 'Overlapping leave request already exists' }
    }

    const approverUserId = Number(employeeProfile.reportsToUserId || 0)
    if (!approverUserId) {
      return {
        success: false,
        message: 'No reporting manager assigned. Cannot submit leave request for approval.',
      }
    }

    const year = start.getUTCFullYear()
    const balance = await ensureLeaveBalance(
      orgId,
      Number(employeeProfile.id),
      leaveTypeId,
      year,
      leaveType.annualAllocationDays,
    )
    const availableDays = Number(balance.allocatedDays || 0) + Number(balance.carriedOverDays || 0) - Number(balance.usedDays || 0)
    if (availableDays < leaveDays) {
      return {
        success: false,
        message: `Insufficient leave balance. Available: ${availableDays}, Requested: ${leaveDays}`,
      }
    }

    const txResult = await db.transaction(async (tx) => {
      const [request] = await tx
        .insert(hrLeaveRequests)
        .values({
          organizationId: orgId,
          employeeProfileId: Number(employeeProfile.id),
          leaveTypeId,
          startDate: startDate as any,
          endDate: endDate as any,
          status: 'PENDING',
          requestedByUserId: userId,
          reason: data.reason || null,
        })
        .returning()

      const [approval] = await tx
        .insert(hrLeaveApprovals)
        .values({
          organizationId: orgId,
          leaveRequestId: Number(request.id),
          requestedByUserId: userId,
          approverUserId,
          status: 'PENDING',
        })
        .returning()

      return { request, approval, leaveDays, availableDays }
    })

    return {
      success: true,
      message: 'Leave request submitted successfully',
      data: txResult,
    }
  } catch (error: any) {
    console.error('Error creating leave request:', error)
    return {
      success: false,
      message: 'Failed to submit leave request',
      error: error?.message,
    }
  }
}
