import { useState } from 'react'
import InterestForm from '../components/InterestForm'
import PageHero from '../components/PageHero'
import { bank } from '../data/content'

export default function Donate() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(bank.accountNumber)
    setCopied(true)
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
            {bank.accountNumber} <button onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
          </div>
        </div>
        <InterestForm
          title="Payment confirmation"
          fields={['Full name', 'Email address', 'Payment reference']}
        />
      </section>
    </>
  )
}
