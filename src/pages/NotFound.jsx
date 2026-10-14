import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="notfound">
      <p className="eyebrow">404</p>
      <h1>This page has moved on.</h1>
      <p>Let’s take you back to the UCFCA community.</p>
      <Link className="button" to="/">
        Return home
      </Link>
    </section>
  )
}
