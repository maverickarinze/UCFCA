import { Images } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageHero from '../components/PageHero'
import { gallery } from '../data/content'
import { formatDate, newestFirst } from '../utils/dates'
import usePageMeta from '../utils/usePageMeta'

export default function Gallery() {
  usePageMeta('Gallery', 'Photos from UCFCA gatherings and community outreach.')
  const albums = newestFirst(gallery)
  return (
    <>
      <PageHero eyebrow="Gallery" title="Moments of friendship and service" />
      <section className="section">
        {albums.length ? (
          albums.map(({ title, date, photos }) => (
            <div className="album" key={date + title}>
              <h2>{title}</h2>
              <time dateTime={date}>{formatDate(date)}</time>
              <div className="photo-grid">
                {photos.map((photo) => (
                  <a key={photo.src} href={photo.src} target="_blank" rel="noreferrer">
                    <img src={photo.src} alt={photo.alt} loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Images}
            title="Photographs and video albums will be added when supplied."
          >
            <p>Check back soon for verified UCFCA updates.</p>
          </EmptyState>
        )}
      </section>
    </>
  )
}
