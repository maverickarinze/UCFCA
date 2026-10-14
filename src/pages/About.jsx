import { Link } from 'react-router-dom'
import { ArrowRight, HandHeart, Heart, ShieldCheck } from 'lucide-react'
import PageHero from '../components/PageHero'
import SectionTitle from '../components/SectionTitle'

const values = [
  { icon: Heart, name: 'Love', text: 'We nurture genuine friendship and care for one another.' },
  { icon: ShieldCheck, name: 'Integrity', text: 'We act with mutual respect and accountability.' },
  {
    icon: HandHeart,
    name: 'Service',
    text: 'We extend friendship through practical community support.',
  },
]

const achievements = [
  'Association Constitution drafted',
  'Successful registration with the Corporate Affairs Commission (CAC)',
  'Association bank account opened',
  'Member celebrations supported through attendance and benefits',
  'Partnership with QS Outreach Kazakhstan is in progress',
]

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About UCFCA"
        title="Friends for Life."
        text="A serious, organized association built around friendship, mutual respect and social impact."
      />
      <section className="section two-col">
        <div>
          <h2>Our story</h2>
          <p>
            Formed by friends in Abuja in 2023, UCFCA exists to strengthen the bonds of friendship
            and extend care to the larger society.
          </p>
          <Link className="text-link" to="/history">
            Explore our history <ArrowRight />
          </Link>
        </div>
        <div className="value-list">
          {values.map(({ icon: ValueIcon, name, text }) => (
            <div key={name}>
              <ValueIcon /> <h3>{name}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section soft">
        <SectionTitle eyebrow="Progress so far" title="Major achievements" />
        <ul className="check-list">
          {achievements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  )
}
