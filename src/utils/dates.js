const formatter = new Intl.DateTimeFormat('en-NG', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

// Dates in content.js are 'YYYY-MM-DD'; parse as local dates so they don't shift by timezone.
export function parseDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(value) {
  return formatter.format(parseDate(value))
}

export function newestFirst(items) {
  return [...items].sort((a, b) => parseDate(b.date) - parseDate(a.date))
}

export function splitEvents(events) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcoming = events
    .filter((e) => parseDate(e.date) >= today)
    .sort((a, b) => parseDate(a.date) - parseDate(b.date))
  const past = newestFirst(events.filter((e) => parseDate(e.date) < today))
  return { upcoming, past }
}
