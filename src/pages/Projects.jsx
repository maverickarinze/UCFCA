import PageHero from '../components/PageHero'
import ProjectGrid from '../components/ProjectGrid'
import usePageMeta from '../utils/usePageMeta'

export default function Projects() {
  usePageMeta(
    'Our projects',
    'UCFCA community projects: feeding programmes, school and medical outreach, and more.',
  )
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
