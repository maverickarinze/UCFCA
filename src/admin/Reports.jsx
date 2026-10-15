import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, Download, MessageCircle, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { abujaParts, formatMeetingDate } from '../lib/time'
import { formatDate } from '../utils/dates'
import { buildReport, formatRate, meetingSummaryCsv, memberSummaryCsv, registerCsv } from './report'
import { whatsappNumber } from './share'

// Supabase returns at most 1,000 rows per request; page through everything.
async function fetchAll(makeQuery) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await makeQuery().range(from, from + 999)
    if (error) throw error
    rows.push(...data)
    if (data.length < 1000) return rows
  }
}

function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.append(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const today = () => abujaParts(new Date().toISOString()).date

function periodRange(period) {
  const t = today()
  if (period === 'all') return [null, null]
  if (period === '12m') return [`${Number(t.slice(0, 4)) - 1}${t.slice(4)}`, null]
  return [`${period}-01-01`, `${period}-12-31`]
}

const COLUMNS = [
  ['full_name', 'Name'],
  ['rate', 'Rate'],
  ['attended', 'Attended'],
  ['late', 'Late'],
  ['excused', 'Excused'],
  ['absent', 'Absent'],
  ['streak', 'Missed in a row'],
]

export default function Reports() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('all')
  const [includeInactive, setIncludeInactive] = useState(false)
  const [threshold, setThreshold] = useState(2)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'rate', dir: 'asc' })

  useEffect(() => {
    Promise.all([
      fetchAll(() =>
        supabase
          .from('members')
          .select('id, full_name, phone, email, joined_on, active')
          .order('full_name'),
      ),
      fetchAll(() =>
        supabase
          .from('meetings')
          .select('id, title, venue, starts_at, closes_at')
          .order('starts_at'),
      ),
      fetchAll(() =>
        supabase
          .from('attendance')
          .select('meeting_id, member_id, status')
          .order('meeting_id')
          .order('member_id'),
      ),
    ])
      .then(([members, meetings, attendance]) => setData({ members, meetings, attendance }))
      .catch((e) => setError(e.message))
  }, [])

  const report = useMemo(() => {
    if (!data) return null
    const [from, to] = periodRange(period)
    return buildReport({
      members: data.members.filter((m) => includeInactive || m.active),
      meetings: data.meetings,
      attendance: data.attendance,
      from,
      to,
    })
  }, [data, period, includeInactive])

  if (error) return <p className="form-status error">Couldn’t load reports: {error}</p>
  if (!report) return <p className="admin-muted">Loading reports…</p>

  const years = [
    ...new Set(data.meetings.map((m) => abujaParts(m.starts_at).date.slice(0, 4))),
  ].reverse()
  const counted = report.members.filter((m) => m.held)
  const totals = report.meetings.reduce(
    (t, m) => ({
      attended: t.attended + m.present + m.late,
      counted: t.counted + m.expected - m.excused,
    }),
    { attended: 0, counted: 0 },
  )
  const followUp = counted.filter((m) => m.streak >= threshold).sort((a, b) => b.streak - a.streak)

  const sorted = [...counted]
    .filter((m) => !query || m.full_name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const x = a[sort.key] ?? -1
      const y = b[sort.key] ?? -1
      const order = typeof x === 'string' ? x.localeCompare(y) : x - y
      return (sort.dir === 'asc' ? order : -order) || a.full_name.localeCompare(b.full_name)
    })
  const sortBy = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))

  const stamp = today()
  const label = period === 'all' ? 'all-time' : period === '12m' ? 'last-12-months' : period

  return (
    <>
      <h1 className="admin-title">Reports</h1>
      <div className="admin-toolbar">
        <label className="admin-inline-field">
          Period
          <select
            className="admin-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="all">All time</option>
            <option value="12m">Last 12 months</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          Include inactive members
        </label>
      </div>

      {!report.meetings.length ? (
        <p className="admin-muted">
          No completed meetings in this period yet. Reports fill in once a meeting’s check-in has
          closed.
        </p>
      ) : (
        <>
          <div className="admin-tally">
            <div>
              <strong>{report.meetings.length}</strong> Meetings held
            </div>
            <div>
              <strong>
                {formatRate(totals.counted ? totals.attended / totals.counted : null)}
              </strong>{' '}
              Average attendance
            </div>
            <div>
              <strong>{counted.filter((m) => m.rate === 1).length}</strong> Perfect attendance
            </div>
            <div>
              <strong>{followUp.length}</strong> Missed {threshold}+ in a row
            </div>
          </div>
          <p className="admin-muted">
            On time and late both count as attended. Excused meetings don’t count against anyone.
          </p>

          <section className="admin-report-section">
            <div className="admin-title-row">
              <h2 className="admin-subtitle">Needs a check-in</h2>
              <label className="admin-inline-field">
                Missed at least
                <select
                  className="admin-select"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                >
                  {[2, 3, 4, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} in a row
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {followUp.length ? (
              <ul className="admin-list">
                {followUp.map((m) => (
                  <li key={m.id}>
                    <div>
                      <strong>{m.full_name}</strong>
                      <span className="admin-status is-absent">Missed last {m.streak}</span>
                      <span className="admin-muted">
                        {m.lastAttended
                          ? `Last attended ${formatDate(m.lastAttended)}`
                          : 'Hasn’t attended yet'}
                      </span>
                    </div>
                    {whatsappNumber(m.phone) && (
                      <div className="admin-row-actions">
                        <a
                          className="admin-link-button"
                          href={`https://wa.me/${whatsappNumber(m.phone)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle aria-hidden="true" /> WhatsApp
                        </a>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-muted">Nobody has missed {threshold} meetings in a row. 🎉</p>
            )}
          </section>

          <section className="admin-report-section">
            <div className="admin-title-row">
              <h2 className="admin-subtitle">Members</h2>
              <label className="admin-search admin-search-small">
                <Search aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Find a member"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Find a member"
                />
              </label>
            </div>
            <div className="admin-table-wrap admin-report-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    {COLUMNS.map(([key, title]) => (
                      <th
                        key={key}
                        aria-sort={
                          sort.key === key
                            ? sort.dir === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : 'none'
                        }
                      >
                        <button className="admin-sort" onClick={() => sortBy(key)}>
                          {title}
                          {sort.key === key &&
                            (sort.dir === 'asc' ? (
                              <ArrowUp aria-hidden="true" />
                            ) : (
                              <ArrowDown aria-hidden="true" />
                            ))}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((m) => (
                    <tr key={m.id}>
                      <td>
                        {m.full_name}
                        {!m.active && <span className="admin-badge">Inactive</span>}
                      </td>
                      <td>
                        <strong>{formatRate(m.rate)}</strong>
                      </td>
                      <td>
                        {m.attended} of {m.held - m.excused}
                      </td>
                      <td>{m.late}</td>
                      <td>{m.excused}</td>
                      <td>{m.absent}</td>
                      <td>{m.streak || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-report-section">
            <h2 className="admin-subtitle">Meetings</h2>
            <div className="admin-table-wrap admin-report-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Meeting</th>
                    <th>On time</th>
                    <th>Late</th>
                    <th>Excused</th>
                    <th>Absent</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {[...report.meetings].reverse().map((mt) => (
                    <tr key={mt.id}>
                      <td>{formatMeetingDate(mt.starts_at)}</td>
                      <td>
                        <Link to={`/admin/meetings/${mt.id}`}>{mt.title}</Link>
                      </td>
                      <td>{mt.present}</td>
                      <td>{mt.late}</td>
                      <td>{mt.excused}</td>
                      <td>{mt.absent}</td>
                      <td>
                        <strong>{formatRate(mt.rate)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-report-section">
            <h2 className="admin-subtitle">Download for Excel</h2>
            <div className="admin-form-actions">
              <button
                className="button"
                onClick={() =>
                  download(`ucfca-attendance-register-${label}-${stamp}.csv`, registerCsv(report))
                }
              >
                <Download aria-hidden="true" /> Attendance register
              </button>
              <button
                className="button ghost"
                onClick={() =>
                  download(`ucfca-member-summary-${label}-${stamp}.csv`, memberSummaryCsv(report))
                }
              >
                <Download aria-hidden="true" /> Member summary
              </button>
              <button
                className="button ghost"
                onClick={() =>
                  download(`ucfca-meeting-summary-${label}-${stamp}.csv`, meetingSummaryCsv(report))
                }
              >
                <Download aria-hidden="true" /> Meeting summary
              </button>
            </div>
            <p className="admin-muted">
              The register has one row per member and one column per meeting (P on time, L late, E
              excused, A absent). Files open in Excel or Google Sheets.
            </p>
          </section>
        </>
      )}
    </>
  )
}
