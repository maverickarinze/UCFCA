import { useState } from 'react'

// Not yet connected to a submission service; submissions only show a confirmation.
export default function InterestForm({ title, fields }) {
  const [sent, setSent] = useState(false)
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
    >
      <h2>{title}</h2>
      {fields.map((f) => (
        <label key={f}>
          {f}
          {f === 'Message' ? (
            <textarea required rows="4" placeholder="Tell us a little more" />
          ) : (
            <input required type={f.includes('Email') ? 'email' : 'text'} />
          )}
        </label>
      ))}
      <button className="button" type="submit">
        Send interest
      </button>
      {sent && (
        <p className="success">Thank you. This form is ready for a future submission service.</p>
      )}
    </form>
  )
}
