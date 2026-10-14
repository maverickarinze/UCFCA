import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { heroSlides } from '../data/content'

const SLIDE_INTERVAL_MS = 5500

export default function HeroCarousel() {
  const [active, setActive] = useState(0)
  const count = heroSlides.length

  useEffect(() => {
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % count),
      SLIDE_INTERVAL_MS,
    )
    return () => window.clearInterval(timer)
  }, [count])

  return (
    <section className="hero">
      <div className="hero-carousel" aria-roledescription="carousel" aria-label="UCFCA highlights">
        <div className="carousel-slides">
          {heroSlides.map((slide, index) => (
            <div
              className={'hero-slide ' + (index === active ? 'active' : '')}
              aria-hidden={index !== active}
              key={slide.image}
            >
              <img src={slide.image} alt={index === active ? slide.alt : ''} />
            </div>
          ))}
        </div>
        <div className="carousel-controls">
          <button
            aria-label="Previous slide"
            onClick={() => setActive((active + count - 1) % count)}
          >
            ←
          </button>
          <div className="carousel-dots">
            {heroSlides.map((slide, index) => (
              <button
                aria-label={'Show ' + slide.title}
                aria-current={index === active}
                className={index === active ? 'active' : ''}
                onClick={() => setActive(index)}
                key={slide.image}
              />
            ))}
          </div>
          <button aria-label="Next slide" onClick={() => setActive((active + 1) % count)}>
            →
          </button>
        </div>
      </div>
      <div className="hero-copy">
        <p className="eyebrow">Ultimate Clique of Friends Club Abuja</p>
        <h1>
          Friendship that <em>moves</em> communities forward.
        </h1>
        <p className="lead">Friends for Life — united by Love, Integrity and Service.</p>
        <div className="actions">
          <Link className="button" to="/membership">
            Become a Member <ArrowUpRight />
          </Link>
          <Link className="button ghost" to="/projects">
            Explore Our Projects
          </Link>
        </div>
      </div>
    </section>
  )
}
