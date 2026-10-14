import { Megaphone } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageHero from '../components/PageHero'
import { news } from '../data/content'
import { formatDate, newestFirst } from '../utils/dates'
import usePageMeta from '../utils/usePageMeta'

export default function News() {
  usePageMeta('News', 'News and announcements from UCFCA.')
  const items = newestFirst(news)
  return (
    <>
      <PageHero eyebrow="News & announcements" title="The latest from UCFCA" />
      <section className="section">
        {items.length ? (
          <div className="news-list">
            {items.map(({ title, date, body = [] }) => (
              <article key={date + title}>
                <time dateTime={date}>{formatDate(date)}</time>
                <h2>{title}</h2>
                {body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon={Megaphone} title="No announcements have been published yet.">
            <p>Check back soon for verified UCFCA updates.</p>
          </EmptyState>
        )}
      </section>
    </>
  )
}
