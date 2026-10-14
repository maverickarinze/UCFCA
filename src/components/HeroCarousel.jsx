import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { heroSlides } from '../data/content'

const SLIDE_INTERVAL_MS = 5500
const SWIPE_THRESHOLD_PX = 40

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

export default function HeroCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(null)
  const count = heroSlides.length

  const go = (index) => setActive((index + count) % count)

  useEffect(() => {
    if (paused || prefersReducedMotion()) return
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % count),
      SLIDE_INTERVAL_MS,
    )
    return () => window.clearInterval(timer)
  }, [paused, count])

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) go(dx < 0 ? active + 1 : active - 1)
  }

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero-carousel" aria-roledescription="carousel" aria-label="UCFCA highlights">
        <div className="carousel-slides">
          {heroSlides.map((slide, index) => (
            <div
              className={'hero-slide ' + (index === active ? 'active' : '')}
              aria-hidden={index !== active}
              key={slide.image}
            >
              <img
                src={slide.image}
                alt={index === active ? slide.alt : ''}
                fetchPriority={index === 0 ? 'high' : 'low'}
                decoding="async"
              />
            </div>
          ))}
        </div>
        <div className="carousel-controls">
          <button aria-label="Previous slide" onClick={() => go(active - 1)}>
            ←
          </button>
          <div className="carousel-dots">
            {heroSlides.map((slide, index) => (
              <button
                aria-label={'Show ' + slide.title}
                aria-current={index === active}
                className={index === active ? 'active' : ''}
                onClick={() => go(index)}
                key={slide.image}
              />
            ))}
          </div>
          <button aria-label="Next slide" onClick={() => go(active + 1)}>
            →
          </button>
        </div>
      </div>
      <div className="hero-copy">
        <h1>Ultimate Clique of Friends Club Abuja</h1>
        <p className="hero-tagline">
          Friendship that <em>moves</em> communities forward.
        </p>
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
