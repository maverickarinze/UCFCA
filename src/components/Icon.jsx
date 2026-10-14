import { Circle, Cross, GraduationCap, HeartHandshake, Sparkles, Stethoscope } from 'lucide-react'

// Icons referenced by name from src/data/content.js
const icons = { Circle, Cross, GraduationCap, HeartHandshake, Sparkles, Stethoscope }

export default function Icon({ name, ...props }) {
  const Component = icons[name] || Circle
  return <Component {...props} />
}
