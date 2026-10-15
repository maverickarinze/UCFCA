import { TIME_ZONE, UTC_OFFSET } from './config'

const timeFormat = new Intl.DateTimeFormat('en-NG', {
  timeZone: TIME_ZONE,
  hour: 'numeric',
  hour12: true,
  minute: '2-digit',
})
const dateTimeFormat = new Intl.DateTimeFormat('en-NG', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  hour12: true,
  minute: '2-digit',
})
const dateFormat = new Intl.DateTimeFormat('en-NG', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export const formatTime = (iso) => timeFormat.format(new Date(iso))
export const formatDateTime = (iso) => dateTimeFormat.format(new Date(iso))
export const formatMeetingDate = (iso) => dateFormat.format(new Date(iso))

// '2026-11-01' + '14:00' in Abuja time -> ISO timestamp.
export const abujaTime = (date, time) => new Date(`${date}T${time}:00${UTC_OFFSET}`).toISOString()

// Date and time parts of a timestamp, as seen in Abuja (for form inputs).
export function abujaParts(iso) {
  const shifted = new Date(new Date(iso).getTime() + 60 * 60 * 1000).toISOString()
  return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) }
}

// General meetings are on the first Sunday of the month: the next one from today.
export function nextFirstSunday(from = new Date()) {
  const { date: today } = abujaParts(from.toISOString())
  let [y, m] = today.split('-').map(Number)
  for (let i = 0; i < 2; i++) {
    const first = new Date(Date.UTC(y, m - 1, 1))
    const sunday = new Date(Date.UTC(y, m - 1, 1 + ((7 - first.getUTCDay()) % 7)))
    const iso = sunday.toISOString().slice(0, 10)
    if (iso >= today) return iso
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
}
