// Where a meeting is in its check-in window: 'upcoming' | 'open' | 'closed'.
export function meetingState(m, now = Date.now()) {
  if (now < Date.parse(m.opens_at)) return 'upcoming'
  if (now > Date.parse(m.closes_at)) return 'closed'
  return 'open'
}
