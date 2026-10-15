// Attendance report calculations, kept free of React and Supabase so they can be tested.
//
// Rules
//   * Only meetings that have closed count.
//   * A member counts for a meeting only if they had joined by its date.
//   * Attendance rate = (on time + late) / (meetings counted - excused).
//   * "Missed in a row": the member's most recent meetings missed without
//     apology, counting back until one they attended. Excused meetings are skipped.

import { abujaParts } from '../lib/time'

const ATTENDED = new Set(['present', 'late'])

export function buildReport({
  members,
  meetings,
  attendance,
  now = Date.now(),
  from = null,
  to = null,
}) {
  const closed = meetings
    .filter((m) => Date.parse(m.closes_at) < now)
    .map((m) => ({ ...m, date: abujaParts(m.starts_at).date }))
    .filter((m) => (!from || m.date >= from) && (!to || m.date <= to))
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))

  const status = new Map(attendance.map((a) => [`${a.meeting_id}:${a.member_id}`, a.status]))
  const statusOf = (meetingId, memberId) => status.get(`${meetingId}:${memberId}`) ?? 'absent'
  const eligible = (member, meeting) => !member.joined_on || meeting.date >= member.joined_on

  const memberRows = members.map((member) => {
    const counts = { present: 0, late: 0, excused: 0, absent: 0 }
    const history = []
    let lastAttended = null
    for (const meeting of closed) {
      if (!eligible(member, meeting)) continue
      const s = statusOf(meeting.id, member.id)
      counts[s]++
      history.push(s)
      if (ATTENDED.has(s)) lastAttended = meeting.date
    }
    let streak = 0
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i] === 'excused') continue
      if (history[i] !== 'absent') break
      streak++
    }
    const held = history.length
    const counted = held - counts.excused
    const attended = counts.present + counts.late
    return {
      ...member,
      held,
      ...counts,
      attended,
      rate: counted ? attended / counted : null,
      streak,
      lastAttended,
    }
  })

  const meetingRows = closed.map((meeting) => {
    const counts = { present: 0, late: 0, excused: 0, absent: 0 }
    let expected = 0
    for (const member of members) {
      if (!eligible(member, meeting)) continue
      expected++
      counts[statusOf(meeting.id, member.id)]++
    }
    const counted = expected - counts.excused
    return {
      ...meeting,
      expected,
      ...counts,
      rate: counted ? (counts.present + counts.late) / counted : null,
    }
  })

  return { members: memberRows, meetings: meetingRows, statusOf, eligible }
}

export const formatRate = (rate) => (rate === null ? '—' : `${Math.round(rate * 100)}%`)

// CSV that Excel opens cleanly (UTF-8 BOM keeps accented names intact).
export function toCsv(rows) {
  const cell = (v) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n'
}

const LETTER = { present: 'P', late: 'L', excused: 'E', absent: 'A' }

export function memberSummaryCsv(report) {
  return toCsv([
    [
      'Name',
      'Phone',
      'Email',
      'Meetings',
      'On time',
      'Late',
      'Excused',
      'Absent',
      'Attendance rate',
      'Missed in a row',
    ],
    ...report.members.map((m) => [
      m.full_name,
      m.phone,
      m.email,
      m.held,
      m.present,
      m.late,
      m.excused,
      m.absent,
      formatRate(m.rate),
      m.streak,
    ]),
  ])
}

// The classic register: one row per member, one column per meeting (P/L/E/A).
export function registerCsv(report) {
  return toCsv([
    ['Name', ...report.meetings.map((mt) => `${mt.date} ${mt.title}`), 'Attendance rate'],
    ...report.members.map((m) => [
      m.full_name,
      ...report.meetings.map((mt) =>
        report.eligible(m, mt) ? LETTER[report.statusOf(mt.id, m.id)] : '',
      ),
      formatRate(m.rate),
    ]),
    [],
    ['P = on time, L = late, E = excused, A = absent; blank = before the member joined'],
  ])
}

export function meetingSummaryCsv(report) {
  return toCsv([
    [
      'Date',
      'Meeting',
      'Venue',
      'Expected',
      'On time',
      'Late',
      'Excused',
      'Absent',
      'Attendance rate',
    ],
    ...report.meetings.map((mt) => [
      mt.date,
      mt.title,
      mt.venue,
      mt.expected,
      mt.present,
      mt.late,
      mt.excused,
      mt.absent,
      formatRate(mt.rate),
    ]),
  ])
}
