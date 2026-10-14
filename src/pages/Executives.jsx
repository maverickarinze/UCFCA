import LeaderCard from '../components/LeaderCard'
import PageHero from '../components/PageHero'
import { executives } from '../data/content'
import usePageMeta from '../utils/usePageMeta'

export default function Executives() {
  usePageMeta('Executive Council', 'Meet the officers of the UCFCA Executive Council.')
  return (
    <>
      <PageHero
        eyebrow="Executive Council"
        title="Leadership in service."
        text="Officer photographs and biographies will appear here when supplied."
      />
      <section className="section">
        <h2 className="sr-only">Executive Council members</h2>
        <div className="leaders all">
          {executives.map((e, i) => (
            <LeaderCard key={e.position} {...e} featured={i === 0} />
          ))}
        </div>
      </section>
    </>
  )
}
