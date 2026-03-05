import { and, eq, lte, gte, ne } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { hrEmployeeProfiles } from '../../../models/HrEmployeeProfile'
import { hrShiftGroups } from '../../../models/HrShiftGroup'
import { hrShifts } from '../../../models/HrShift'

export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

export function dateToYmdUTC(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addDaysUTC(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setUTCDate(copy.getUTCDate() + days)
  return copy
}

export function parseShiftDateTimeUtc(dateYmd: string, timeHHmm: string): Date {
  return new Date(`${dateYmd}T${timeHHmm}:00.000Z`)
}

function getTzDateParts(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = dtf.formatToParts(date)
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  }
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = getTzDateParts(date, timeZone)
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )
  return asUtc - date.getTime()
}

function dateTimeMatchesInZone(date: Date, timeZone: string, dateYmd: string, timeHHmm: string) {
  const [year, month, day] = dateYmd.split('-').map((v) => Number(v))
  const [hour, minute] = timeHHmm.split(':').map((v) => Number(v))
  const parts = getTzDateParts(date, timeZone)
  return (
    parts.year === year &&
    parts.month === month &&
    parts.day === day &&
    parts.hour === hour &&
    parts.minute === minute
  )
}

export function zonedDateTimeToUtc(dateYmd: string, timeHHmm: string, timeZone: string): Date {
  const [year, month, day] = dateYmd.split('-').map((v) => Number(v))
  const [hour, minute] = timeHHmm.split(':').map((v) => Number(v))

  const requestedUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0)
  let guessUtcMs = requestedUtcMs

  for (let i = 0; i < 5; i++) {
    const guessDate = new Date(guessUtcMs)
    const offsetMs = getTimeZoneOffsetMs(guessDate, timeZone)
    const nextGuess = requestedUtcMs - offsetMs
    if (nextGuess === guessUtcMs) break
    guessUtcMs = nextGuess
  }

  let result = new Date(guessUtcMs)

  if (dateTimeMatchesInZone(result, timeZone, dateYmd, timeHHmm)) {
    return result
  }

  // DST forward gap: move to nearest valid minute in the same local date.
  for (let addMin = 1; addMin <= 180; addMin++) {
    const adjustedMinuteUtcMs = Date.UTC(year, month - 1, day, hour, minute + addMin, 0)
    let adjustedGuess = adjustedMinuteUtcMs

    for (let i = 0; i < 5; i++) {
      const guessDate = new Date(adjustedGuess)
      const offsetMs = getTimeZoneOffsetMs(guessDate, timeZone)
      const nextGuess = adjustedMinuteUtcMs - offsetMs
      if (nextGuess === adjustedGuess) break
      adjustedGuess = nextGuess
    }

    const adjustedDate = new Date(adjustedGuess)
    const localParts = getTzDateParts(adjustedDate, timeZone)
    if (localParts.year !== year || localParts.month !== month || localParts.day !== day) {
      break
    }

    if (localParts.hour * 60 + localParts.minute >= hour * 60 + minute) {
      return adjustedDate
    }
  }

  return result
}

export function minutesOfTime(timeHHmm: string): number {
  const [hh, mm] = timeHHmm.split(':').map((v) => Number(v))
  return hh * 60 + mm
}

export async function getEmployeeProfile(orgId: number, employeeProfileId: number) {
  const [employee] = await db
    .select()
    .from(hrEmployeeProfiles)
    .where(
      and(
        eq(hrEmployeeProfiles.id, Number(employeeProfileId)),
        eq(hrEmployeeProfiles.organizationId, orgId),
      ),
    )
    .limit(1)
  return employee || null
}

export async function getShiftGroup(orgId: number, shiftGroupId: number) {
  const [group] = await db
    .select()
    .from(hrShiftGroups)
    .where(
      and(
        eq(hrShiftGroups.id, Number(shiftGroupId)),
        eq(hrShiftGroups.organizationId, orgId),
      ),
    )
    .limit(1)
  return group || null
}

export async function hasShiftOverlap(params: {
  orgId: number
  employeeProfileId: number
  shiftStartAt: Date
  shiftEndAt: Date
  excludeShiftId?: number
}) {
  const base = [
    eq(hrShifts.organizationId, params.orgId),
    eq(hrShifts.employeeProfileId, params.employeeProfileId),
    ne(hrShifts.status, 'CANCELLED'),
    lte(hrShifts.shiftStartAt, params.shiftEndAt as any),
    gte(hrShifts.shiftEndAt, params.shiftStartAt as any),
  ] as any[]

  if (params.excludeShiftId) {
    base.push(ne(hrShifts.id, Number(params.excludeShiftId)))
  }

  const [overlap] = await db
    .select({ id: hrShifts.id })
    .from(hrShifts)
    .where(and(...base))
    .limit(1)

  return Boolean(overlap)
}
