import { UserRound } from 'lucide-react'

export default function LeaderCard({ position, name, featured }) {
  return (
    <article className={'leader ' + (featured ? 'featured' : '')}>
      <div className="avatar">
        <UserRound />
      </div>
      <p>{position}</p>
      <h3>{name}</h3>
    </article>
  )
}
