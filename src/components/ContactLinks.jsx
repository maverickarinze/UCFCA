import { contact } from '../data/content'

export default function ContactLinks() {
  return (
    <>
      {contact.phones.map((phone) => (
        <a key={phone.href} href={phone.href}>
          {phone.label}
        </a>
      ))}
      <a href={`mailto:${contact.email}`}>{contact.email}</a>
    </>
  )
}
