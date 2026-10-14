import { Link } from 'react-router-dom'
import Brand from './Brand'
import ContactLinks from './ContactLinks'

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
        <h4>Explore</h4>
        <Link to="/about">About UCFCA</Link>
        <Link to="/projects">Our projects</Link>
        <Link to="/membership">Membership</Link>
        <Link to="/constitution">Constitution</Link>
      </div>
      <div>
        <h4>Contact</h4>
        <ContactLinks facebook />
      </div>
      <div className="copyright">
        © {new Date().getFullYear()} UCFCA. <span>Love · Integrity · Service</span>
      </div>
    </footer>
  )
}
