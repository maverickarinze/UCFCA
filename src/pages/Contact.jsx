import { CalendarDays, Mail, Phone } from 'lucide-react'
import Form from '../components/Form'
import PageHero from '../components/PageHero'
import { contact, meetings } from '../data/content'

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact UCFCA"
        title="Let’s connect"
        text="Use the details below to get in touch with Ultimate Clique of Friends Club Abuja."
      />
      <section className="section two-col">
        <div className="contact-info">
          <h2>Get in touch</h2>
          <div>
            <Mail />
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
          <div>
            <Phone />
            <span>
              {contact.phones.map((phone) => (
                <a key={phone.href} href={phone.href}>
                  {phone.label}
                </a>
              ))}
            </span>
          </div>
          <div>
            <CalendarDays />
            <p>{meetings}</p>
          </div>
          <a className="text-link" href={contact.facebook} target="_blank" rel="noreferrer">
            Follow us on Facebook
          </a>
        </div>
        <Form
          title="Send us a message"
          subject="Contact message"
          submitLabel="Send message"
          successMessage="Thank you — your message has been sent. We’ll get back to you soon."
          fields={[
            { name: 'name', label: 'Full name', autoComplete: 'name' },
            { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email' },
            { name: 'message', label: 'Message', type: 'textarea' },
          ]}
        />
      </section>
    </>
  )
}
