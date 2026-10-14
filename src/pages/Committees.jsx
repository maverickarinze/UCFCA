import { UsersRound } from 'lucide-react'
import PageHero from '../components/PageHero'
import { committees } from '../data/content'
import usePageMeta from '../utils/usePageMeta'

export default function Committees() {
  usePageMeta('Committees', 'The UCFCA standing committees: Investment, Health, and Project/Media.')
  return (
    <>
      <PageHero eyebrow="How we work" title="Standing committees." />
      <section className="section committee-grid">
        {committees.map((c) => (
          <article key={c.name}>
            <UsersRound />
            <h2>{c.name}</h2>
            <p>{c.responsibility}</p>
            <strong>
              {c.chairTitle}: {c.chair}
            </strong>
          </article>
        ))}
      </section>
    </>
  )
}
