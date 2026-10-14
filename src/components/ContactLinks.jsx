import { contact } from '../data/content'

export default function ContactLinks({ facebook = false }) {
  return (
    <>
      {contact.phones.map((phone) => (
        <a key={phone.href} href={phone.href}>
          {phone.label}
        </a>
      ))}
      <a href={`mailto:${contact.email}`}>{contact.email}</a>
      {facebook && (
        <a href={contact.facebook} target="_blank" rel="noreferrer">
          Facebook
        </a>
      )}
    </>
  )
}
