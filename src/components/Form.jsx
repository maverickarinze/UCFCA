import { useState } from 'react'
import { contact } from '../data/content'

const ENDPOINT = 'https://api.web3forms.com/submit'
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY

// Field shape: { name, label, type?: 'text' | 'email' | 'tel' | 'textarea', required?: true, autoComplete? }
export default function Form({ title, subject, fields, submitLabel = 'Send', successMessage }) {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    if (!ACCESS_KEY) {
      setStatus('error')
      setError('This form is not connected yet.')
      return
    }

    setStatus('sending')
    const data = Object.fromEntries(new FormData(form))
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...data,
          access_key: ACCESS_KEY,
          subject: `UCFCA website: ${subject}`,
          from_name: 'UCFCA website',
        }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.message)
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
      setError('Something went wrong sending your message.')
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{title}</h2>
      {fields.map(({ name, label, type = 'text', required = true, autoComplete }) => (
        <label key={name}>
          {label}
          {!required && <span className="optional"> (optional)</span>}
          {type === 'textarea' ? (
            <textarea
              name={name}
              required={required}
              rows="4"
              placeholder="Tell us a little more"
            />
          ) : (
            <input name={name} type={type} required={required} autoComplete={autoComplete} />
          )}
        </label>
      ))}
      {/* Honeypot: hidden from people, filled in by spam bots */}
      <input
        type="checkbox"
        name="botcheck"
        className="botcheck"
        tabIndex="-1"
        autoComplete="off"
      />
      <button className="button" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : submitLabel}
      </button>
      <div aria-live="polite">
        {status === 'sent' && <p className="form-status success">{successMessage}</p>}
        {status === 'error' && (
          <p className="form-status error">
            {error} Please email us at <a href={`mailto:${contact.email}`}>{contact.email}</a>.
          </p>
        )}
      </div>
    </form>
  )
}
