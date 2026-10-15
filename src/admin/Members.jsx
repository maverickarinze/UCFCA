import { useCallback, useEffect, useMemo, useState } from 'react'
import { CaseSensitive, FileUp, Pencil, Plus, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate } from '../utils/dates'
import { normaliseEmail, normalisePhone, parseMemberList } from './memberImport'
import { tidyName } from './names'

const COLUMNS = 'id, full_name, email, phone, address, joined_on, active'

// Turns database errors into something an officer can act on.
function describeError(error) {
  if (error.code === '23505' && error.message.includes('members_email_key'))
    return 'Another member already uses that email address.'
  return error.message
}

function MemberForm({ member, onSave, onCancel }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    setSaving(true)
    const result = await onSave({
      full_name: tidyName(data.full_name),
      email: normaliseEmail(data.email).value,
      phone: data.phone.trim() ? normalisePhone(data.phone) : null,
      address: data.address.trim() || null,
      joined_on: data.joined_on || null,
    })
    setSaving(false)
    if (result?.error) setError(result.error)
  }

  return (
    <form className="admin-member-form" onSubmit={handleSubmit}>
      <label>
        Full name
        <input name="full_name" defaultValue={member?.full_name} required autoFocus />
      </label>
      <label>
        Email
        <input name="email" type="email" defaultValue={member?.email ?? ''} />
      </label>
      <label>
        Phone number
        <input name="phone" type="tel" defaultValue={member?.phone ?? ''} />
      </label>
      <label>
        Date joined <span className="optional">(optional)</span>
        <input name="joined_on" type="date" defaultValue={member?.joined_on ?? ''} />
      </label>
      <label className="admin-span">
        Address
        <input name="address" defaultValue={member?.address ?? ''} />
      </label>
      <div className="admin-form-actions">
        <button className="button" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button className="button ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      {error && <p className="form-status error">{error}</p>}
    </form>
  )
}

function ImportPanel({ existing, onImported, onClose }) {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { rows } = useMemo(() => parseMemberList(text, existing), [text, existing])
  const ready = rows.filter((r) => !r.error && !r.duplicate)
  const problems = rows.filter((r) => r.error)
  const duplicates = rows.filter((r) => r.duplicate)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (file) setText(await file.text())
  }

  async function handleImport() {
    setSaving(true)
    setError('')
    const { error } = await supabase.from('members').insert(
      ready.map(({ full_name, email, phone, address, joined_on }) => ({
        full_name,
        email,
        phone,
        address,
        joined_on,
      })),
    )
    setSaving(false)
    if (error) setError(describeError(error))
    else onImported(ready.length)
  }

  return (
    <section className="admin-panel">
      <h2>Import members</h2>
      <p className="admin-muted">
        Copy your member sheet <strong>including its header row</strong> (Name, Email, Address,
        Phone Number) and paste it below, or upload it as a CSV file. Columns can be in any order; a
        Date Joined column (DD/MM/YYYY) is optional.
      </p>
      <textarea
        rows="6"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          'Name\tEmail\tAddress\tPhone Number\nAda Obi\tada@example.com\tWuse 2, Abuja\t08031234567'
        }
        aria-label="Member rows"
      />
      <label className="admin-file">
        <FileUp aria-hidden="true" /> Upload a .csv file
        <input type="file" accept=".csv,.txt,text/csv" onChange={handleFile} />
      </label>

      {rows.length > 0 && (
        <>
          <p className="admin-import-summary">
            <strong>{ready.length}</strong> ready to import
            {duplicates.length > 0 && <> · {duplicates.length} already listed (skipped)</>}
            {problems.length > 0 && <> · {problems.length} with problems (skipped)</>}
          </p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Line</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className={r.error ? 'is-error' : r.duplicate ? 'is-muted' : ''}>
                    <td>{r.line}</td>
                    <td>{r.full_name || '—'}</td>
                    <td>{r.email || '—'}</td>
                    <td>{r.phone || '—'}</td>
                    <td>{r.address || '—'}</td>
                    <td>{r.error ?? (r.duplicate ? 'Already listed' : 'Ready')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="admin-form-actions">
        <button className="button" onClick={handleImport} disabled={!ready.length || saving}>
          {saving
            ? 'Importing…'
            : `Import ${ready.length || ''} member${ready.length === 1 ? '' : 's'}`}
        </button>
        <button className="button ghost" onClick={onClose}>
          Close
        </button>
      </div>
      {error && <p className="form-status error">{error}</p>}
    </section>
  )
}

// Previews capitalisation fixes for existing names, then saves them in one go.
function TidyNamesPanel({ members, onDone, onClose }) {
  const changes = members
    .map((m) => ({ id: m.id, from: m.full_name, to: tidyName(m.full_name) }))
    .filter((c) => c.to !== c.from)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function apply() {
    setSaving(true)
    const results = await Promise.all(
      changes.map((c) => supabase.from('members').update({ full_name: c.to }).eq('id', c.id)),
    )
    setSaving(false)
    const failed = results.filter((r) => r.error).length
    if (failed) setError(`${failed} name${failed === 1 ? '' : 's'} couldn’t be saved. Try again.`)
    onDone(changes.length - failed, !failed)
  }

  return (
    <section className="admin-panel">
      <h2>Tidy name capitalisation</h2>
      {changes.length ? (
        <>
          <p className="admin-muted">
            Names typed in ALL CAPS or all lowercase are changed to normal capitalisation. Nothing
            is saved until you confirm.
          </p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Current</th>
                  <th>Becomes</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr key={c.id}>
                    <td>{c.from}</td>
                    <td>
                      <strong>{c.to}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-form-actions">
            <button className="button" onClick={apply} disabled={saving}>
              {saving
                ? 'Saving…'
                : `Update ${changes.length} name${changes.length === 1 ? '' : 's'}`}
            </button>
            <button className="button ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="admin-muted">All names already have normal capitalisation.</p>
          <div className="admin-form-actions">
            <button className="button ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </>
      )}
      {error && <p className="form-status error">{error}</p>}
    </section>
  )
}

export default function Members({ officer }) {
  const canEdit = officer.role === 'recorder'
  const [members, setMembers] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [mode, setMode] = useState(null) // null | 'add' | 'import' | member id being edited
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('members').select(COLUMNS).order('full_name')
    if (error) setLoadError(error.message)
    else setMembers(data)
  }, [])

  useEffect(() => {
    // Initial fetch; load() only sets state once the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const existing = useMemo(() => members ?? [], [members])
  const visible = (members ?? []).filter(
    (m) =>
      (showInactive || m.active) &&
      (!query ||
        m.full_name.toLowerCase().includes(query.toLowerCase()) ||
        m.email?.includes(query.toLowerCase()) ||
        m.phone?.includes(query)),
  )
  const activeCount = (members ?? []).filter((m) => m.active).length

  async function addMember(values) {
    const { error } = await supabase.from('members').insert(values)
    if (error) return { error: describeError(error) }
    setMode(null)
    setNotice(`${values.full_name} added.`)
    load()
  }

  async function updateMember(id, values) {
    const { error } = await supabase.from('members').update(values).eq('id', id)
    if (error) return { error: describeError(error) }
    setMode(null)
    setNotice('Changes saved.')
    load()
  }

  async function toggleActive(member) {
    const { error } = await supabase
      .from('members')
      .update({ active: !member.active })
      .eq('id', member.id)
    setNotice(
      error
        ? error.message
        : `${member.full_name} marked ${member.active ? 'inactive' : 'active'}.`,
    )
    load()
  }

  return (
    <>
      <div className="admin-title-row">
        <h1 className="admin-title">Members</h1>
        {canEdit && (
          <div className="admin-form-actions">
            <button className="button" onClick={() => setMode('add')}>
              <Plus aria-hidden="true" /> Add member
            </button>
            <button className="button ghost" onClick={() => setMode('import')}>
              <FileUp aria-hidden="true" /> Import list
            </button>
            <button className="button ghost" onClick={() => setMode('tidy')}>
              <CaseSensitive aria-hidden="true" /> Tidy names
            </button>
          </div>
        )}
      </div>
      <p className="admin-muted">
        {members ? `${activeCount} active` : 'Loading…'}
        {members && members.length !== activeCount && ` · ${members.length - activeCount} inactive`}
        {!canEdit && ' · You have view-only access.'}
      </p>
      <p className="admin-notice" aria-live="polite">
        {notice}
      </p>
      {loadError && <p className="form-status error">Couldn’t load members: {loadError}</p>}

      {mode === 'add' && (
        <section className="admin-panel">
          <h2>Add a member</h2>
          <MemberForm onSave={addMember} onCancel={() => setMode(null)} />
        </section>
      )}
      {mode === 'tidy' && (
        <TidyNamesPanel
          members={existing}
          onClose={() => setMode(null)}
          onDone={(n, allSaved) => {
            if (allSaved) setMode(null)
            setNotice(`${n} name${n === 1 ? '' : 's'} updated.`)
            load()
          }}
        />
      )}
      {mode === 'import' && (
        <ImportPanel
          existing={existing}
          onClose={() => setMode(null)}
          onImported={(n) => {
            setMode(null)
            setNotice(`${n} member${n === 1 ? '' : 's'} imported.`)
            load()
          }}
        />
      )}

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name, email or phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search members"
          />
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show inactive
        </label>
      </div>

      {members && !visible.length && (
        <p className="admin-muted">
          {members.length
            ? 'No members match.'
            : 'No members yet. Add them one by one or import your list.'}
        </p>
      )}
      <ul className="admin-list">
        {visible.map((m) =>
          mode === m.id ? (
            <li key={m.id} className="is-editing">
              <MemberForm
                member={m}
                onSave={(values) => updateMember(m.id, values)}
                onCancel={() => setMode(null)}
              />
            </li>
          ) : (
            <li key={m.id} className={m.active ? '' : 'is-inactive'}>
              <div>
                <strong>{m.full_name}</strong>
                {!m.active && <span className="admin-badge">Inactive</span>}
                <span className="admin-muted">
                  {[m.email, m.phone, m.joined_on && `Joined ${formatDate(m.joined_on)}`]
                    .filter(Boolean)
                    .join(' · ') || 'No contact details yet'}
                </span>
                {m.address && <span className="admin-muted admin-address">{m.address}</span>}
              </div>
              {canEdit && (
                <div className="admin-row-actions">
                  <button className="admin-link-button" onClick={() => setMode(m.id)}>
                    <Pencil aria-hidden="true" /> Edit
                  </button>
                  <button className="admin-link-button" onClick={() => toggleActive(m)}>
                    {m.active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              )}
            </li>
          ),
        )}
      </ul>
    </>
  )
}
