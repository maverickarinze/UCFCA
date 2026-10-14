import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Icon from './Icon'
import SectionTitle from './SectionTitle'
import { projects } from '../data/content'

// Full project list on /projects; a titled preview on the home page when `limit` is set.
export default function ProjectGrid({ limit }) {
  const list = limit ? projects.slice(0, limit) : projects
  return (
    <section className="section projects">
      {limit ? (
        <SectionTitle
          eyebrow="Community impact"
          title="Service in action."
          text="Practical initiatives shaped by compassion and community needs."
        />
      ) : (
        <h2 className="sr-only">All projects</h2>
      )}
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
