import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrShiftLayouts } from '../../../models/HrShiftLayout'
import { hrShiftLayoutRules } from '../../../models/HrShiftLayoutRule'
import { ReqObjectType } from '../../../utils/types'
import { getShiftGroup } from './_helpers'

interface LayoutRuleInput {
  dayOfWeek: number
  startTime: string
  endTime: string
  isOffDay?: boolean
}

interface Params {
  reqObject: ReqObjectType
  data: {
    organizationId?: number
    shiftGroupId: number
    name: string
    timezone?: string
    rules: LayoutRuleInput[]
  }
}

function isValidIanaTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date())
    return true
  } catch {
    return false
  }
}

export async function createHrShiftLayout_func({ reqObject, data }: Params) {
  try {
    const orgId = Number(data.organizationId || reqObject.user.organizationId)
    if (!orgId) return { success: false, message: 'Organization not found for user' }

    const group = await getShiftGroup(orgId, Number(data.shiftGroupId))
    if (!group) return { success: false, message: 'Shift group not found' }

    const name = String(data.name || '').trim()
    if (!name) return { success: false, message: 'Layout name is required' }
    const timezone = String(data.timezone || 'UTC').trim()
    if (!isValidIanaTimezone(timezone)) {
      return { success: false, message: 'Invalid timezone. Use a valid IANA timezone (e.g. Asia/Dhaka, America/New_York)' }
    }
    if (!Array.isArray(data.rules) || data.rules.length === 0) {
      return { success: false, message: 'At least one layout rule is required' }
    }

    const daySet = new Set<number>()
    for (const rule of data.rules) {
      if (daySet.has(Number(rule.dayOfWeek))) {
        return { success: false, message: `Duplicate dayOfWeek in rules: ${rule.dayOfWeek}` }
      }
      daySet.add(Number(rule.dayOfWeek))
    }

    const [existing] = await db
      .select({ id: hrShiftLayouts.id })
      .from(hrShiftLayouts)
      .where(
        and(
          eq(hrShiftLayouts.organizationId, orgId),
          eq(hrShiftLayouts.shiftGroupId, Number(data.shiftGroupId)),
          eq(hrShiftLayouts.name, name),
        ),
      )
      .limit(1)
    if (existing) {
      return { success: false, message: 'Layout name already exists for this shift group' }
    }

    const txResult = await db.transaction(async (tx) => {
      const [layout] = await tx
        .insert(hrShiftLayouts)
        .values({
          organizationId: orgId,
          shiftGroupId: Number(data.shiftGroupId),
          name,
          timezone,
          isActive: true,
          createdByUserId: Number(reqObject.user.id),
        })
        .returning()

      const createdRules = await tx
        .insert(hrShiftLayoutRules)
        .values(
          data.rules.map((rule) => ({
            organizationId: orgId,
            layoutId: Number(layout.id),
            dayOfWeek: Number(rule.dayOfWeek),
            startTime: String(rule.startTime),
            endTime: String(rule.endTime),
            isOffDay: Boolean(rule.isOffDay),
          })),
        )
        .returning()

      return { layout, rules: createdRules }
    })

    return { success: true, message: 'Shift layout created successfully', data: txResult }
  } catch (error: any) {
    console.error('Error creating shift layout:', error)
    return { success: false, message: 'Failed to create shift layout', error: error?.message }
  }
}
