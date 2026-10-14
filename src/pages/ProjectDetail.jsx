import { Link, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import PageHero from '../components/PageHero'
import { projects } from '../data/content'
import NotFound from './NotFound'

export default function ProjectDetail() {
  const { slug } = useParams()
  const p = projects.find((x) => x.slug === slug)
  if (!p) return <NotFound />

  return (
    <>
      <PageHero
        eyebrow={p.historical ? 'Community outreach' : 'Project in development'}
        title={p.name}
        text={p.description}
      />
      <section className="section project-detail">
        <div className="project-icon big">
          <Icon name={p.icon} />
        </div>
        <div>
          <h2>Project information</h2>
          <dl>
            <dt>Location</dt>
            <dd>{p.location}</dd>
            <dt>Impact</dt>
            <dd>{p.impact}</dd>
            <dt>Status</dt>
            <dd>{p.historical ? 'Historical UCFCA project' : 'More details coming soon'}</dd>
          </dl>
          <p>
            Project dates, objectives, gallery items and related events will be published as
            verified information is available.
          </p>
          <Link className="button" to="/donate">
            Support our mission
          </Link>
        </div>
      </section>
    </>
  )
}
