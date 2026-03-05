import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrEmployeeProfiles } from '../../../models/HrEmployeeProfile'
import { hrPolicyConfigs } from '../../../models/HrPolicyConfig'
import { hrTimeBreaks } from '../../../models/HrTimeBreak'
import { hrTimePunchEvents } from '../../../models/HrTimePunchEvent'
import { hrTimeSessions } from '../../../models/HrTimeSession'
import { hrTimeBreakApprovals } from '../../../models/HrTimeBreakApproval'
import { hrTimeSessionApprovals } from '../../../models/HrTimeSessionApproval'
import { ReqObjectType } from '../../../utils/types'

export async function getEmployeeProfileForUser(reqObject: ReqObjectType) {
  const userId = Number(reqObject.user.id)
  const orgId = Number(reqObject.user.organizationId)

  if (!orgId || !userId) return null

  const [profile] = await db
    .select()
    .from(hrEmployeeProfiles)
    .where(
      and(
        eq(hrEmployeeProfiles.userId, userId),
        eq(hrEmployeeProfiles.organizationId, orgId),
      ),
    )
    .limit(1)

  return profile || null
}

export async function getAllowedBreakMinutes(orgId: number, employeePolicyId?: number | null) {
  if (employeePolicyId) {
    const [employeePolicy] = await db
      .select({ allowedBreakMinutes: hrPolicyConfigs.allowedBreakMinutes })
      .from(hrPolicyConfigs)
      .where(
        and(
          eq(hrPolicyConfigs.id, Number(employeePolicyId)),
          eq(hrPolicyConfigs.organizationId, orgId),
        ),
      )
      .limit(1)

    if (employeePolicy) {
      return Number(employeePolicy.allowedBreakMinutes || 30)
    }
  }

  const [appliedPolicy] = await db
    .select({ allowedBreakMinutes: hrPolicyConfigs.allowedBreakMinutes })
    .from(hrPolicyConfigs)
    .where(
      and(
        eq(hrPolicyConfigs.organizationId, orgId),
        eq(hrPolicyConfigs.isApplied, true),
      ),
    )
    .limit(1)

  return Number(appliedPolicy?.allowedBreakMinutes || 30)
}

export async function getOpenSession(orgId: number, employeeProfileId: number) {
  const [session] = await db
    .select()
    .from(hrTimeSessions)
    .where(
      and(
        eq(hrTimeSessions.organizationId, orgId),
        eq(hrTimeSessions.employeeProfileId, employeeProfileId),
        isNull(hrTimeSessions.clockOutAt),
      ),
    )
    .orderBy(desc(hrTimeSessions.id))
    .limit(1)

  return session || null
}

export async function getOpenBreak(orgId: number, timeSessionId: number) {
  const [openBreak] = await db
    .select()
    .from(hrTimeBreaks)
    .where(
      and(
        eq(hrTimeBreaks.organizationId, orgId),
        eq(hrTimeBreaks.timeSessionId, timeSessionId),
        isNull(hrTimeBreaks.breakEndAt),
      ),
    )
    .orderBy(desc(hrTimeBreaks.id))
    .limit(1)

  return openBreak || null
}

export async function getBreakMinutesBySession(timeSessionId: number) {
  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${hrTimeBreaks.durationMinutes}), 0)`,
    })
    .from(hrTimeBreaks)
    .where(eq(hrTimeBreaks.timeSessionId, timeSessionId))

  return Number(row?.total || 0)
}

export async function getCompletedBreakCount(timeSessionId: number) {
  const [row] = await db
    .select({
      total: sql<number>`COUNT(*)`,
    })
    .from(hrTimeBreaks)
    .where(
      and(
        eq(hrTimeBreaks.timeSessionId, timeSessionId),
        sql`${hrTimeBreaks.breakEndAt} IS NOT NULL`,
      ),
    )

  return Number(row?.total || 0)
}

export async function getSessionApproval(timeSessionId: number) {
  const [approval] = await db
    .select()
    .from(hrTimeSessionApprovals)
    .where(eq(hrTimeSessionApprovals.timeSessionId, timeSessionId))
    .limit(1)

  return approval || null
}

export async function getBreakApproval(timeBreakId: number) {
  const [approval] = await db
    .select()
    .from(hrTimeBreakApprovals)
    .where(eq(hrTimeBreakApprovals.timeBreakId, timeBreakId))
    .limit(1)

  return approval || null
}

export async function logPunchEvent(params: {
  organizationId: number
  timeSessionId: number
  employeeProfileId: number
  userId: number
  eventType: 'CLOCK_IN' | 'BREAK_OUT' | 'BREAK_IN' | 'CLOCK_OUT'
  source?: string
  eventAt?: Date
}) {
  await db.insert(hrTimePunchEvents).values({
    organizationId: params.organizationId,
    timeSessionId: params.timeSessionId,
    employeeProfileId: params.employeeProfileId,
    userId: params.userId,
    eventType: params.eventType,
    source: params.source || 'API',
    eventAt: params.eventAt || new Date(),
  })
}
