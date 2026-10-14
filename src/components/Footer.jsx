import { Link } from 'react-router-dom'
import Brand from './Brand'
import ContactLinks from './ContactLinks'
import SocialLinks from './SocialLinks'

export default function Footer() {
  return (
    <footer>
      <div>
        <Link className="brand light" to="/">
          <Brand />
        </Link>
        <p>
          Ultimate Clique of Friends Club Abuja is a community of friendship, service and lasting
          impact.
        </p>
      </div>
      <div>
        <h2>Explore</h2>
        <Link to="/about">About UCFCA</Link>
        <Link to="/projects">Our projects</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/membership">Membership</Link>
        <Link to="/constitution">Constitution</Link>
      </div>
      <div>
        <h2>Contact</h2>
        <ContactLinks />
        <SocialLinks className="on-dark" />
      </div>
      <div className="copyright">
        © {new Date().getFullYear()} UCFCA. <span>Love · Integrity · Service</span>
      </div>
    </footer>
  )
}
