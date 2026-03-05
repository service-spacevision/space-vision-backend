import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrEmployeeProfiles } from '../../../models/HrEmployeeProfile'
import { hrPolicyConfigs } from '../../../models/HrPolicyConfig'
import { hrLeaveBalances } from '../../../models/HrLeaveBalance'
import { hrLeaveTypes } from '../../../models/HrLeaveType'

export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

export function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function diffDaysInclusive(startDate: string, endDate: string): number {
  const start = parseDateOnly(startDate)
  const end = parseDateOnly(endDate)
  const ms = end.getTime() - start.getTime()
  return Math.floor(ms / 86400000) + 1
}

export async function getEmployeeProfileByUserId(orgId: number, userId: number) {
  const [employeeProfile] = await db
    .select()
    .from(hrEmployeeProfiles)
    .where(
      and(
        eq(hrEmployeeProfiles.organizationId, orgId),
        eq(hrEmployeeProfiles.userId, userId),
      ),
    )
    .limit(1)
  return employeeProfile
}

export async function getEffectivePolicy(orgId: number, employeePolicyId?: number | null) {
  if (employeePolicyId) {
    const [employeePolicy] = await db
      .select()
      .from(hrPolicyConfigs)
      .where(
        and(
          eq(hrPolicyConfigs.id, Number(employeePolicyId)),
          eq(hrPolicyConfigs.organizationId, orgId),
        ),
      )
      .limit(1)
    if (employeePolicy) return employeePolicy
  }

  const [appliedPolicy] = await db
    .select()
    .from(hrPolicyConfigs)
    .where(
      and(
        eq(hrPolicyConfigs.organizationId, orgId),
        eq(hrPolicyConfigs.isApplied, true),
      ),
    )
    .limit(1)

  return appliedPolicy || null
}

export async function getLeaveType(orgId: number, leaveTypeId: number) {
  const [leaveType] = await db
    .select()
    .from(hrLeaveTypes)
    .where(
      and(
        eq(hrLeaveTypes.id, leaveTypeId),
        eq(hrLeaveTypes.organizationId, orgId),
      ),
    )
    .limit(1)
  return leaveType
}

export async function ensureLeaveBalance(orgId: number, employeeProfileId: number, leaveTypeId: number, year: number, annualAllocationDays?: number | null) {
  const [existing] = await db
    .select()
    .from(hrLeaveBalances)
    .where(
      and(
        eq(hrLeaveBalances.organizationId, orgId),
        eq(hrLeaveBalances.employeeProfileId, employeeProfileId),
        eq(hrLeaveBalances.leaveTypeId, leaveTypeId),
        eq(hrLeaveBalances.year, year),
      ),
    )
    .limit(1)

  if (existing) return existing

  const [created] = await db
    .insert(hrLeaveBalances)
    .values({
      organizationId: orgId,
      employeeProfileId,
      leaveTypeId,
      year,
      allocatedDays: Number(annualAllocationDays || 0),
      usedDays: 0,
      carriedOverDays: 0,
    })
    .returning()

  return created
}

