import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import LeaderCard from '../components/LeaderCard'
import PageHero from '../components/PageHero'
import SectionTitle from '../components/SectionTitle'
import { committees, executives } from '../data/content'
import usePageMeta from '../utils/usePageMeta'

export default function Executives() {
  usePageMeta(
    'Leadership',
    'Meet the UCFCA Executive Council and the chairs of our standing committees.',
  )
  return (
    <>
      <PageHero
        eyebrow="Leadership"
        title="Leadership in service."
        text="Officer photographs and biographies will appear here when supplied."
      />
      <section className="section">
        <SectionTitle eyebrow="Executive Council" title="Officers of the Association" />
        <div className="leaders all">
          {executives.map((e, i) => (
            <LeaderCard key={e.position} {...e} featured={i === 0} />
          ))}
        </div>
      </section>
      <section className="section">
        <SectionTitle
          eyebrow="Standing committees"
          title="Committee chairs"
          text="Each standing committee is led by a chair who works alongside the Executive Council."
        />
        <div className="leaders all">
          {committees.map((c) => (
            <LeaderCard key={c.name} position={c.name} name={c.chair} role={c.chairTitle} />
          ))}
        </div>
        <Link className="text-link" to="/committees">
          What our committees do <ArrowRight />
        </Link>
      </section>
    </>
  )
}
