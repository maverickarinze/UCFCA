import { CalendarClock } from 'lucide-react'
import PageHero from '../components/PageHero'

// Holding page for sections whose content hasn't been supplied yet (events, gallery, news).
export default function Placeholder({ eyebrow, title, message }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} />
      <section className="section empty">
        <CalendarClock />
        <h2>{message}</h2>
        <p>Check back soon for verified UCFCA updates.</p>
      </section>
    </>
  )
}
