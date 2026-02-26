type TimeZoneParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const DEFAULT_TIME_ZONE = 'Africa/Johannesburg'

function getParts(date: Date, timeZone: string): TimeZoneParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(date)
  const values: Record<string, number> = {}
  for (const part of parts) {
    if (part.type === 'literal') continue
    values[part.type] = Number(part.value)
  }
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  }
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = getParts(date, timeZone)
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  )
  return asUtc - date.getTime()
}

function makeWallDateUtc(year: number, month: number, day: number, hour: number, minute = 0, second = 0) {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second))
}

function addDaysUtc(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

export function zonedWallTimeToUtc(wallDateUtc: Date, timeZone: string) {
  const offset = getTimeZoneOffsetMs(wallDateUtc, timeZone)
  return new Date(wallDateUtc.getTime() - offset)
}

export function formatDateLong(date: Date, timeZone = DEFAULT_TIME_ZONE) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatTimeShort(date: Date, timeZone = DEFAULT_TIME_ZONE) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatIsoDate(date: Date, timeZone = DEFAULT_TIME_ZONE) {
  const parts = getParts(date, timeZone)
  const yyyy = String(parts.year).padStart(4, '0')
  const mm = String(parts.month).padStart(2, '0')
  const dd = String(parts.day).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function getWindowBounds(
  now: Date,
  timeZone: string,
  workStartHour: number,
  workDurationHours: number
) {
  const tz = timeZone || DEFAULT_TIME_ZONE
  const nowParts = getParts(now, tz)
  let wallStart = makeWallDateUtc(nowParts.year, nowParts.month, nowParts.day, workStartHour, 0, 0)
  if (nowParts.hour < workStartHour) {
    wallStart = addDaysUtc(wallStart, -1)
  }
  const start = zonedWallTimeToUtc(wallStart, tz)
  const end = new Date(start.getTime() + workDurationHours * 60 * 60 * 1000)
  const windowDate = formatIsoDate(start, tz)
  return { start, end, windowDate }
}

export const DEFAULT_TIME_ZONE_NAME = DEFAULT_TIME_ZONE
