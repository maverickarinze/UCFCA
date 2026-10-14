import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Icon from './Icon'
import SectionTitle from './SectionTitle'
import { projects } from '../data/content'

// Full project list on /projects; a short preview on the home page when `limit` is set.
export default function ProjectGrid({ limit }) {
  const list = limit ? projects.slice(0, limit) : projects
  return (
    <section className="section projects">
      <SectionTitle
        eyebrow="Community impact"
        title={limit ? 'Service in action.' : 'Our projects'}
        text={
          limit
            ? 'Practical initiatives shaped by compassion and community needs.'
            : 'Our current service focus areas. Project details are added as they become available.'
        }
      />
      <div className="project-grid">
        {list.map((p) => (
          <article className="project-card" key={p.slug}>
            <div className="project-icon">
              <Icon name={p.icon} />
            </div>
            <span>{p.historical ? 'Documented outreach' : 'Project in development'}</span>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <Link to={'/projects/' + p.slug}>
              Discover project <ArrowUpRight />
            </Link>
          </article>
        ))}
      </div>
      {limit && (
        <Link className="text-link" to="/projects">
          See all projects <ArrowRight />
        </Link>
      )}
    </section>
  )
}
