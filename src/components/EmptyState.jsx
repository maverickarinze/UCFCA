import { CalendarClock } from 'lucide-react'

export default function EmptyState({ icon: StateIcon = CalendarClock, title, children }) {
  return (
    <div className="empty">
      <StateIcon />
      {title && <h2>{title}</h2>}
      {children}
    </div>
  )
}
