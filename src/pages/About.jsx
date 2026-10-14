import { Link } from 'react-router-dom'
import { ArrowRight, HandHeart, Heart, ShieldCheck } from 'lucide-react'
import PageHero from '../components/PageHero'
import usePageMeta from '../utils/usePageMeta'

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
  usePageMeta(
    'About',
    'Who UCFCA is: a club of friends in Abuja built on Love, Integrity and Service, and what it has achieved so far.',
  )
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
          <h3 className="subheading">Major achievements</h3>
          <ul className="check-list">
            {achievements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
    </>
  )
}
