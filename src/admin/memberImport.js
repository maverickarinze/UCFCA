// Parses a pasted or uploaded member list (CSV, or tab-separated when copied
// straight out of Excel/Google Sheets). Columns: name, phone, date joined.

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

const looksLikeHeader = (cells) => /name/i.test(cells[0] ?? '')

// Returns one entry per non-empty line: { line, full_name, phone, joined_on, error?, duplicate? }
export function parseMemberList(text, existingNames = []) {
  const lines = text.replace(/\r/g, '').split('\n')
  const sep = lines.some((l) => l.includes('\t')) ? '\t' : ','
  const seen = new Set(existingNames.map((n) => n.trim().toLowerCase()))
  const rows = []
  lines.forEach((raw, i) => {
    if (!raw.trim()) return
    const cells = splitLine(raw, sep).map((c) => c.trim())
    if (i === 0 && looksLikeHeader(cells)) return
    const [full_name = '', phone = '', joined = ''] = cells
    const row = {
      line: i + 1,
      full_name,
      phone: phone ? normalisePhone(phone) : null,
      joined_on: null,
    }
    const date = parseDate(joined)
    if (!full_name) row.error = 'Missing name'
    else if (date.error) row.error = date.error
    else row.joined_on = date.value
    const key = full_name.toLowerCase()
    if (!row.error && seen.has(key)) row.duplicate = true
    seen.add(key)
    rows.push(row)
  })
  return rows
}
