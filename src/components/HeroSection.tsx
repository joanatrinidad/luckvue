import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Movie } from '../types'
import { fetchTrailerKey } from '../api/tmdb'
import { backdropSrcSet, heroPosterSrcSet } from '../api/images'
import TrailerPreview from './TrailerPreview'

interface Props {
  movie:     Movie
  onPlay?:   () => void
  playLabel?: string
}

export default function HeroSection({ movie, onPlay, playLabel = 'Watch Now' }: Props) {
  const navigate = useNavigate()

  const [showPreview, setShowPreview] = useState(false)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const hoverTimer = useRef<number | null>(null)

  useEffect(() => {
    setShowPreview(false)
    setTrailerKey(null)
  }, [movie.id])

  useEffect(() => () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
  }, [])

  function handleMouseEnter() {
    hoverTimer.current = window.setTimeout(async () => {
      setShowPreview(true)
      if (trailerKey === null) {
        const key = await fetchTrailerKey(movie.id, movie.type)
        setTrailerKey(key ?? '')
      }
    }, 600)
  }

  function handleMouseLeave() {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
    setShowPreview(false)
  }

  return (
    <section
      className="hero"
      aria-label={`Featured: ${movie.title}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      <picture>

        {movie.poster && (
          <source
            media="(max-width: 768px) and (orientation: portrait)"
            srcSet={heroPosterSrcSet(movie.poster)}
            sizes="100vw"
          />
        )}
        <img
          className="hero__img"
          src={movie.backdrop}
          srcSet={backdropSrcSet(movie.backdrop)}
          sizes="100vw"
          alt=""
          aria-hidden="true"
        />
      </picture>

      {showPreview && trailerKey && (
        <TrailerPreview
          trailerKey={trailerKey}
          className="hero__trailer"
          hiddenClassName="hero__trailer--hidden"
          controlsClassName="hero__preview-controls"
        />
      )}

      <div className="hero__overlay" aria-hidden="true" />
      <div className="hero__fog" aria-hidden="true" />

      <div className="hero__content">

        <div className="hero__badge">
          <span className="hero__badge-dot" />
          Now Streaming
        </div>

        <h1 className="hero__title">{movie.title}</h1>

        <div className="hero__tags">

          {movie.genres.slice(0, 2).map(genre => (
            <span key={genre} className="hero__tag">{genre}</span>
          ))}
          <span className="hero__tag hero__tag--year">{movie.year}</span>
        </div>

        <p className="hero__desc">{movie.description}</p>

        <div className="hero__actions">
          <button
            className="hero__btn-play"
            onClick={() => onPlay
              ? onPlay()
              : navigate(movie.type === 'tv' ? `/show/tv/${movie.id}` : `/player/movie/${movie.id}`)
            }
          >
            ▶ {playLabel}
          </button>
          <div className="hero__rating">
            <span className="hero__star">★</span>
            <span className="hero__score">{movie.rating}</span>
            <span className="hero__out-of">/ 10</span>
          </div>
        </div>
      </div>
    </section>
  )
}
