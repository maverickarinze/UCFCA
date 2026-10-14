import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, CalendarDays } from 'lucide-react'
import HeroCarousel from '../components/HeroCarousel'
import LeaderCard from '../components/LeaderCard'
import ProjectGrid from '../components/ProjectGrid'
import SectionTitle from '../components/SectionTitle'
import { executives, stats } from '../data/content'

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <section className="stats">
        {stats.map((s) => (
          <div key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </section>
      <section className="split welcome">
        <div>
          <p className="eyebrow">A message from the President</p>
          <h2>Welcome to our community.</h2>
        </div>
        <blockquote>
          “Our club is built on the enduring values of Love, Integrity, and Service. True friendship
          extends beyond companionship—it inspires us to serve our communities, support one another,
          and create meaningful, lasting impact.”
          <cite>
            Peter Iboro <span>President, UCFCA</span>
          </cite>
        </blockquote>
      </section>
      <section className="section">
        <SectionTitle
          eyebrow="Who we are"
          title="A circle of friends with a wider purpose."
          text="UCFCA brings people together in mutual respect, friendship and practical service to society."
        />
        <Link className="text-link" to="/history">
          Read our story <ArrowRight />
        </Link>
      </section>
      <ProjectGrid limit={3} />
      <section className="dark-cta">
        <div>
          <p className="eyebrow">Make an impact with us</p>
          <h2>Friendship is stronger when it serves.</h2>
        </div>
        <Link className="button" to="/donate">
          Support our mission <ArrowUpRight />
        </Link>
      </section>
      <section className="section">
        <SectionTitle eyebrow="Leadership" title="Guided by service." />
        <div className="leaders">
          {executives.slice(0, 4).map((e, i) => (
            <LeaderCard key={e.position} {...e} featured={i === 0} />
          ))}
        </div>
        <Link className="text-link" to="/executives">
          Meet the Executive Council <ArrowRight />
        </Link>
      </section>
      <section className="section soft">
        <SectionTitle
          eyebrow="Stay connected"
          title="Join the next chapter."
          text="Upcoming events and news will be shared here as they are announced."
        />
        <div className="empty">
          <CalendarDays />
          <p>No upcoming events have been announced yet.</p>
          <Link to="/events">Visit events</Link>
        </div>
      </section>
    </>
  )
}
