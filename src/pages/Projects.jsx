import PageHero from '../components/PageHero'
import ProjectGrid from '../components/ProjectGrid'

export default function Projects() {
  return (
    <>
      <PageHero
        eyebrow="Community impact"
        title="Our projects."
        text="Our current service focus areas. Project details are added as they become available."
      />
      <ProjectGrid />
    </>
  )
}
