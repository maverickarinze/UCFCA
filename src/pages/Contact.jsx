import { CalendarDays, Mail, Phone } from 'lucide-react'
import Form from '../components/Form'
import SocialLinks from '../components/SocialLinks'
import PageHero from '../components/PageHero'
import { contact, meetings } from '../data/content'
import usePageMeta from '../utils/usePageMeta'

export default function Contact() {
  usePageMeta(
    'Contact',
    'Get in touch with Ultimate Clique of Friends Club Abuja by email, phone or message.',
  )
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
          <h3 className="subheading">Follow us</h3>
          <SocialLinks />
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
