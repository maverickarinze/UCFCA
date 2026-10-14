import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import InterestForm from '../components/InterestForm'
import PageHero from '../components/PageHero'
import SectionTitle from '../components/SectionTitle'

// Conditions as listed in Article 2 of the Constitution
const requirements = [
  'Obtain and submit the membership application form (₦1,000).',
  'Have an existing member as guarantor.',
  'Attend the screening or interview day(s) set by the Executive.',
  'Attend two consecutive monthly general meetings for orientation.',
  'Pay the non-refundable registration fee (₦3,000) and present payment evidence to the Financial Secretary.',
  'Attend formal induction and take the Oath of Allegiance when invited.',
]

const faqs = [
  [
    'When are general meetings held?',
    'The Constitution states that general meetings are held every first Sunday of the month.',
  ],
  [
    'Does submitting this form make me a member?',
    'No. This is an expression-of-interest form structure for future processing.',
  ],
]

export default function Membership() {
  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Belong to something meaningful."
        text="Explore UCFCA and prepare an expression of interest."
      />
      <section className="section two-col">
        <div>
          <h2>Membership at UCFCA</h2>
          <p>
            Membership is open to interested adult men and women who share the Association’s
            ideology. The Constitution provides for a three-month probation period before full
            induction, if eligible.
          </p>
          <h3>Conditions for membership</h3>
          <ol className="requirements">
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <Link className="text-link" to="/constitution">
            Read the Constitution <ArrowRight />
          </Link>
        </div>
        <InterestForm
          title="Membership interest"
          fields={['Full name', 'Email address', 'Phone number', 'Message']}
        />
      </section>
      <section className="section soft">
        <SectionTitle eyebrow="Frequently asked" title="Membership FAQ" />
        <div className="faq">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
