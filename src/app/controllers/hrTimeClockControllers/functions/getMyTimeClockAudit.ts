import { and, asc, eq, gte, lt } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrTimePunchEvents } from '../../../models/HrTimePunchEvent'
import { ReqObjectType } from '../../../utils/types'
import { getEmployeeProfileForUser } from './_helpers'

interface Params {
  reqObject: ReqObjectType
  date?: string
}

export async function getMyTimeClockAudit_func({ reqObject, date }: Params) {
  try {
    const organizationId = Number(reqObject.user.organizationId)
    if (!organizationId) return { success: false, message: 'Organization not found for user' }

    const profile = await getEmployeeProfileForUser(reqObject)
    if (!profile) {
      return {
        success: false,
        message: 'Employee profile not found. Assign employee profile first.',
      }
    }

    const conditions: any[] = [
      eq(hrTimePunchEvents.organizationId, organizationId),
      eq(hrTimePunchEvents.employeeProfileId, profile.id),
    ]

    if (date) {
      const dayStart = new Date(`${date}T00:00:00.000Z`)
      const dayEnd = new Date(`${date}T23:59:59.999Z`)
      if (!isNaN(dayStart.getTime()) && !isNaN(dayEnd.getTime())) {
        conditions.push(gte(hrTimePunchEvents.eventAt, dayStart))
        conditions.push(lt(hrTimePunchEvents.eventAt, dayEnd))
      }
    }

    const rows = await db
      .select()
      .from(hrTimePunchEvents)
      .where(and(...conditions))
      .orderBy(asc(hrTimePunchEvents.eventAt))

    return {
      success: true,
      message: 'Time clock audit fetched successfully',
      data: rows,
    }
  } catch (error: any) {
    console.error('Error fetching time clock audit:', error)
    return {
      success: false,
      message: 'Failed to fetch time clock audit',
      error: error?.message,
    }
  }
}
