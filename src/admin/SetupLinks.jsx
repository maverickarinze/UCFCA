import { useState } from 'react'
import { Copy, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { copyText, setupMessage, setupUrl, whatsappLink, whatsappNumber } from './share'

async function createLink(member) {
  const { data, error } = await supabase.rpc('officer_create_setup_token', {
    p_member_id: member.id,
  })
  if (error) throw error
  return setupUrl(data)
}

function ShareButtons({ member, url }) {
  const [copied, setCopied] = useState(false)
  const message = setupMessage(member.full_name, url)
  return (
    <div className="admin-row-actions">
      <a
        className="admin-link-button"
        href={whatsappLink(member.phone, message)}
        target="_blank"
        rel="noreferrer"
        title={
          whatsappNumber(member.phone)
            ? undefined
            : 'No usable phone number: WhatsApp will ask who to send to'
        }
      >
        <MessageCircle aria-hidden="true" /> WhatsApp
      </a>
      <button
        className="admin-link-button"
        onClick={async () => setCopied(await copyText(message))}
      >
        <Copy aria-hidden="true" /> {copied ? 'Copied' : 'Copy message'}
      </button>
    </div>
  )
}

// One member: create (or replace) their setup link and share it.
export function SetupLinkPanel({ member, hasPin, onDone, onClose }) {
  const [url, setUrl] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setBusy(true)
    try {
      setUrl(await createLink(member))
      onDone()
    } catch (e) {
      setError(e.message)
    }
    setBusy(false)
  }

  return (
    <section className="admin-panel">
      <h2>{hasPin ? `Reset PIN for ${member.full_name}` : `Setup link for ${member.full_name}`}</h2>
      {!url ? (
        <>
          <p className="admin-muted">
            {hasPin
              ? 'They already have a PIN. A new link lets them choose a new one and signs them out of other phones once used.'
              : 'Creates a personal link for choosing a PIN. It works once and expires in 14 days. Any earlier unused link stops working.'}
          </p>
          <div className="admin-form-actions">
            <button className="button" onClick={generate} disabled={busy}>
              {busy ? 'Creating…' : 'Create link'}
            </button>
            <button className="button ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="admin-muted">Send this to {member.full_name.split(' ')[0]} only:</p>
          <p className="admin-link-box">{url}</p>
          <ShareButtons member={member} url={url} />
          <div className="admin-form-actions">
            <button className="button ghost" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      )}
      {error && <p className="form-status error">{error}</p>}
    </section>
  )
}

// Everyone who hasn't set a PIN yet: create links in one go, then share each.
export function BulkSetupLinks({ members, onDone, onClose }) {
  const [links, setLinks] = useState(null) // [{ member, url }]
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  async function generate() {
    const made = []
    setProgress(0)
    for (const member of members) {
      try {
        made.push({ member, url: await createLink(member) })
      } catch (e) {
        setError(`Stopped at ${member.full_name}: ${e.message}`)
        break
      }
      setProgress(made.length)
    }
    setLinks(made)
    onDone()
  }

  return (
    <section className="admin-panel">
      <h2>Setup links</h2>
      {!members.length ? (
        <p className="admin-muted">Every active member has set a PIN.</p>
      ) : !links ? (
        <>
          <p className="admin-muted">
            {members.length} active member{members.length === 1 ? ' hasn’t' : 's haven’t'} set a PIN
            yet. This creates a personal link for each (valid 14 days), replacing any unused links,
            and lists them so you can send each one on WhatsApp.
          </p>
          <div className="admin-form-actions">
            <button className="button" onClick={generate} disabled={progress > 0}>
              {progress > 0
                ? `Creating… ${progress}/${members.length}`
                : `Create ${members.length} links`}
            </button>
            <button className="button ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="admin-muted">
            Send each member their own link. Tap WhatsApp to open a chat with the message ready.
          </p>
          <ul className="admin-list admin-list-compact">
            {links.map(({ member, url }) => (
              <li key={member.id}>
                <div>
                  <strong>{member.full_name}</strong>
                  <span className="admin-muted">{member.phone ?? 'No phone number'}</span>
                </div>
                <ShareButtons member={member} url={url} />
              </li>
            ))}
          </ul>
          <div className="admin-form-actions">
            <button className="button ghost" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      )}
      {error && <p className="form-status error">{error}</p>}
    </section>
  )
}
