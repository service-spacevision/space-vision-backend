export async function getHrShiftTimezones_func() {
  try {
    const supportedValuesOf = (Intl as any).supportedValuesOf
    if (typeof supportedValuesOf !== 'function') {
      return {
        success: true,
        message: 'Timezone list fetched successfully',
        data: ['UTC'],
      }
    }

    const timezones = supportedValuesOf('timeZone')
      .map((tz: unknown) => String(tz))
      .filter((tz: string) => tz.length > 0)
      .sort((a: string, b: string) => a.localeCompare(b))

    return {
      success: true,
      message: 'Timezone list fetched successfully',
      data: timezones,
    }
  } catch (error: any) {
    console.error('Error fetching timezone list:', error)
    return { success: false, message: 'Failed to fetch timezone list', error: error?.message }
  }
}
