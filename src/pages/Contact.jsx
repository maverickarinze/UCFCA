import { Mail } from 'lucide-react'
import PageHero from '../components/PageHero'
import { contact } from '../data/content'

export default function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact UCFCA" title="Let’s connect" />
      <section className="section empty">
        <Mail />
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        {contact.phones.map((phone) => (
          <a key={phone.href} href={phone.href}>
            {phone.label}
          </a>
        ))}
      </section>
    </>
  )
}
