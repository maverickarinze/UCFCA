import { useState } from 'react'
import Form from '../components/Form'
import PageHero from '../components/PageHero'
import { bank } from '../data/content'
import usePageMeta from '../utils/usePageMeta'

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older browsers / non-HTTPS: fall back to a temporary textarea
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.append(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    textarea.remove()
    return ok
  }
}

export default function Donate() {
  usePageMeta('Support UCFCA', 'Support UCFCA’s community work by direct bank transfer.')
  const [copyState, setCopyState] = useState('idle') // idle | copied | failed
  const copy = async () => {
    setCopyState((await copyText(bank.accountNumber)) ? 'copied' : 'failed')
  }

  return (
    <>
      <PageHero
        eyebrow="Support UCFCA"
        title="Help friendship create impact."
        text="Your direct support helps UCFCA continue its service-focused work in the community."
      />
      <section className="section two-col">
        <div className="bank">
          <span>Direct bank transfer</span>
          <h2>{bank.name}</h2>
          <p>Account name</p>
          <strong>{bank.accountName}</strong>
          <p>Account number</p>
          <div className="account">
            {bank.accountNumber}{' '}
            <button onClick={copy}>{copyState === 'copied' ? 'Copied' : 'Copy'}</button>
          </div>
          <p className="copy-status" aria-live="polite">
            {copyState === 'failed' &&
              'Copy failed — please select the number and copy it manually.'}
          </p>
        </div>
        <Form
          title="Payment confirmation"
          subject="Payment confirmation"
          submitLabel="Send confirmation"
          successMessage="Thank you for supporting UCFCA. The Financial Secretary will confirm receipt."
          fields={[
            { name: 'name', label: 'Full name', autoComplete: 'name' },
            { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email' },
            { name: 'amount', label: 'Amount (₦)', required: false },
            { name: 'reference', label: 'Payment reference' },
          ]}
        />
      </section>
    </>
  )
}
