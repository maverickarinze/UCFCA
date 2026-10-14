import { UsersRound } from 'lucide-react'
import PageHero from '../components/PageHero'
import { committees } from '../data/content'

export default function Committees() {
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
