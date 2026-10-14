import EmptyState from '../components/EmptyState'
import EventCard from '../components/EventCard'
import PageHero from '../components/PageHero'
import SectionTitle from '../components/SectionTitle'
import { events, meetings } from '../data/content'
import { splitEvents } from '../utils/dates'

export default function Events() {
  const { upcoming, past } = splitEvents(events)
  return (
    <>
      <PageHero eyebrow="Events" title="Upcoming and past events" text={meetings} />
      <section className="section">
        <SectionTitle eyebrow="Coming up" title="Upcoming events" />
        {upcoming.length ? (
          <div className="card-list">
            {upcoming.map((e) => (
              <EventCard key={e.date + e.title} {...e} />
            ))}
          </div>
        ) : (
          <EmptyState title="No upcoming events have been announced yet.">
            <p>Check back soon for verified UCFCA updates.</p>
          </EmptyState>
        )}
      </section>
      {past.length > 0 && (
        <section className="section soft">
          <SectionTitle eyebrow="Archive" title="Past events" />
          <div className="card-list">
            {past.map((e) => (
              <EventCard key={e.date + e.title} {...e} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
