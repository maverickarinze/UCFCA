// Parses a pasted or uploaded member list (CSV, or tab-separated when copied
// straight out of Excel/Google Sheets). Columns are matched by their header
// names, in any order; without a header row the club register's order is used.

const COLUMN_PATTERNS = {
  full_name: /^(full\s*)?name$/i,
  email: /^e-?mail(\s*address)?$/i,
  address: /^(home\s*|residential\s*)?address$/i,
  phone: /^(phone|mobile|tel(ephone)?)(\s*(number|no\.?))?$/i,
  joined: /^(date\s*(of\s*)?join(ed|ing)?|join(ed)?\s*date|joined)$/i,
}

// The member register's column order: Name, Email, Address, Phone Number.
const DEFAULT_COLUMNS = ['full_name', 'email', 'address', 'phone']

function splitLine(line, sep) {
  if (sep === '\t') return line.split('\t')
  const cells = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      cells.push(cell)
      cell = ''
    } else cell += ch
  }
  cells.push(cell)
  return cells
}

// Spreadsheets often drop the leading 0 from Nigerian numbers (8031234567).
export function normalisePhone(raw) {
  const digits = raw.replace(/[^\d+]/g, '')
  if (/^[789]\d{9}$/.test(digits)) return '0' + digits
  return digits
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function normaliseEmail(raw) {
  const email = raw.trim().toLowerCase()
  return {
    value: email || null,
    error: email && !EMAIL.test(email) ? `“${raw.trim()}” isn't a valid email` : undefined,
  }
}

// Accepts 2024-03-10, 10/03/2024 or 10-03-2024 (day first, as used in Nigeria).
export function parseDate(raw) {
  const s = raw.trim()
  if (!s) return { value: null }
  let y, m, d
  let match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (match) [, y, m, d] = match
  else if ((match = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/))) [, d, m, y] = match
  else return { error: `“${s}” isn't a date (use DD/MM/YYYY)` }
  const date = new Date(Date.UTC(+y, +m - 1, +d))
  if (date.getUTCMonth() !== +m - 1 || date.getUTCDate() !== +d)
    return { error: `“${s}” isn't a real date` }
  return { value: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` }
}

// Maps header cells to fields, or returns null if the line isn't a header.
function readHeader(cells) {
  const columns = cells.map((cell) => {
    const label = cell.trim()
    return Object.keys(COLUMN_PATTERNS).find((field) => COLUMN_PATTERNS[field].test(label)) ?? null
  })
  return columns.includes('full_name') ? columns : null
}

// Returns { columns, rows }. Each row:
// { line, full_name, email, address, phone, joined_on, error?, duplicate? }
export function parseMemberList(text, existing = []) {
  const lines = text.replace(/\r/g, '').split('\n')
  const sep = lines.some((l) => l.includes('\t')) ? '\t' : ','
  const seenNames = new Set(existing.map((m) => m.full_name.trim().toLowerCase()))
  const seenEmails = new Set(existing.filter((m) => m.email).map((m) => m.email.toLowerCase()))
  let columns = null
  const rows = []

  lines.forEach((raw, i) => {
    if (!raw.trim()) return
    const cells = splitLine(raw, sep).map((c) => c.trim())
    if (!columns) {
      const header = readHeader(cells)
      columns = header ?? DEFAULT_COLUMNS
      if (header) return
    }
    const value = (field) => cells[columns.indexOf(field)] ?? ''

    const row = {
      line: i + 1,
      full_name: value('full_name'),
      email: null,
      address: null,
      phone: null,
      joined_on: null,
    }
    const email = normaliseEmail(value('email'))
    const joined = parseDate(value('joined'))
    row.email = email.value
    row.address = value('address') || null
    row.phone = value('phone') ? normalisePhone(value('phone')) : null
    if (!row.full_name) row.error = 'Missing name'
    else if (email.error) row.error = email.error
    else if (joined.error) row.error = joined.error
    else row.joined_on = joined.value

    const nameKey = row.full_name.toLowerCase()
    if (!row.error && (seenNames.has(nameKey) || (row.email && seenEmails.has(row.email))))
      row.duplicate = true
    seenNames.add(nameKey)
    if (row.email) seenEmails.add(row.email)
    rows.push(row)
  })

  return { columns: columns ?? DEFAULT_COLUMNS, rows }
}
