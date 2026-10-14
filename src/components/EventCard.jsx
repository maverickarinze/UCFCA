import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { formatDate } from '../utils/dates'

export default function EventCard({ title, date, time, location, description }) {
  return (
    <article className="event-card">
      <h3>{title}</h3>
      <ul className="event-meta">
        <li>
          <CalendarDays /> <time dateTime={date}>{formatDate(date)}</time>
        </li>
        {time && (
          <li>
            <Clock /> {time}
          </li>
        )}
        {location && (
          <li>
            <MapPin /> {location}
          </li>
        )}
      </ul>
      {description && <p>{description}</p>}
    </article>
  )
}
