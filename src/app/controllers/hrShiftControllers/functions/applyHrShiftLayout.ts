import { and, eq, gte, lte } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrShiftGroupMembers } from '../../../models/HrShiftGroupMember'
import { hrShiftLayouts } from '../../../models/HrShiftLayout'
import { hrShiftLayoutRules } from '../../../models/HrShiftLayoutRule'
import { hrShifts } from '../../../models/HrShift'
import { ReqObjectType } from '../../../utils/types'
import {
  addDaysUTC,
  dateToYmdUTC,
  hasShiftOverlap,
  minutesOfTime,
  parseDateOnly,
  zonedDateTimeToUtc,
} from './_helpers'

interface Params {
  reqObject: ReqObjectType
  data: {
    layoutId: number
    startDate: string
    endDate: string
    overwriteExistingLayoutShifts?: boolean
  }
}

export async function applyHrShiftLayout_func({ reqObject, data }: Params) {
  try {
    const orgId = Number(reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const [layout] = await db
      .select()
      .from(hrShiftLayouts)
      .where(
        and(
          eq(hrShiftLayouts.id, Number(data.layoutId)),
          eq(hrShiftLayouts.organizationId, orgId),
        ),
      )
      .limit(1)
    if (!layout) return { success: false, message: 'Shift layout not found' }
    const timeZone = String(layout.timezone || 'UTC')
    try {
      Intl.DateTimeFormat('en-US', { timeZone }).format(new Date())
    } catch {
      return { success: false, message: 'Layout has invalid timezone configuration' }
    }

    const rules = await db
      .select()
      .from(hrShiftLayoutRules)
      .where(
        and(
          eq(hrShiftLayoutRules.layoutId, Number(layout.id)),
          eq(hrShiftLayoutRules.organizationId, orgId),
        ),
      )
    if (!rules.length) return { success: false, message: 'Shift layout has no rules' }

    const members = await db
      .select({ employeeProfileId: hrShiftGroupMembers.employeeProfileId })
      .from(hrShiftGroupMembers)
      .where(
        and(
          eq(hrShiftGroupMembers.shiftGroupId, Number(layout.shiftGroupId)),
          eq(hrShiftGroupMembers.organizationId, orgId),
        ),
      )
    if (!members.length) return { success: false, message: 'No members found in shift group' }

    const start = parseDateOnly(String(data.startDate))
    const end = parseDateOnly(String(data.endDate))
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, message: 'Invalid startDate or endDate' }
    }
    if (end < start) return { success: false, message: 'endDate must be same as or after startDate' }

    if (data.overwriteExistingLayoutShifts) {
      const deleteStart = addDaysUTC(start, -1)
      const deleteEnd = addDaysUTC(end, 2)
      await db
        .delete(hrShifts)
        .where(
          and(
            eq(hrShifts.organizationId, orgId),
            eq(hrShifts.layoutId, Number(layout.id)),
            gte(hrShifts.shiftStartAt, deleteStart as any),
            lte(hrShifts.shiftStartAt, deleteEnd as any),
          ),
        )
    }

    const ruleMap = new Map<number, (typeof rules)[number]>()
    for (const rule of rules) ruleMap.set(Number(rule.dayOfWeek), rule)

    let cursor = new Date(start)
    let createdCount = 0
    const skipped: Array<{ employeeProfileId: number; date: string; reason: string }> = []

    while (cursor <= end) {
      const dow = cursor.getUTCDay()
      const dateYmd = dateToYmdUTC(cursor)
      const rule = ruleMap.get(dow)

      if (rule && !rule.isOffDay) {
        const startAt = zonedDateTimeToUtc(dateYmd, String(rule.startTime), timeZone)
        let endAt = zonedDateTimeToUtc(dateYmd, String(rule.endTime), timeZone)
        if (minutesOfTime(String(rule.endTime)) <= minutesOfTime(String(rule.startTime))) {
          const nextDateYmd = dateToYmdUTC(addDaysUTC(cursor, 1))
          endAt = zonedDateTimeToUtc(nextDateYmd, String(rule.endTime), timeZone)
        }

        for (const member of members) {
          const employeeProfileId = Number(member.employeeProfileId)
          const overlap = await hasShiftOverlap({
            orgId,
            employeeProfileId,
            shiftStartAt: startAt,
            shiftEndAt: endAt,
          })
          if (overlap) {
            skipped.push({ employeeProfileId, date: dateYmd, reason: 'OVERLAP' })
            continue
          }

          await db.insert(hrShifts).values({
            organizationId: orgId,
            employeeProfileId,
            shiftGroupId: Number(layout.shiftGroupId),
            layoutId: Number(layout.id),
            layoutRuleId: Number(rule.id),
            shiftStartAt: startAt,
            shiftEndAt: endAt,
            source: 'LAYOUT',
            status: 'SCHEDULED',
            createdByUserId: Number(reqObject.user.id),
          })
          createdCount++
        }
      }

      cursor = addDaysUTC(cursor, 1)
    }

    return {
      success: true,
      message: 'Shift layout applied successfully',
      data: {
        layoutId: Number(layout.id),
        shiftGroupId: Number(layout.shiftGroupId),
        startDate: data.startDate,
        endDate: data.endDate,
        timezone: timeZone,
        createdCount,
        skippedCount: skipped.length,
        skipped,
      },
    }
  } catch (error: any) {
    console.error('Error applying shift layout:', error)
    return { success: false, message: 'Failed to apply shift layout', error: error?.message }
  }
}
