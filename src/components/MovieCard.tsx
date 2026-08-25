import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Movie } from '../types'
import { fetchTrailerKey } from '../api/tmdb'
import { posterSrcSet, POSTER_SIZES } from '../api/images'
import TrailerPreview from './TrailerPreview'

interface Props {
  movie: Movie
}

function NoPoster() {
  return (
    <div className="card__no-poster">

      <svg
        className="card__no-poster-icon"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >

        <rect x="2" y="4" width="20" height="16" rx="2" stroke="#F4C542" strokeWidth="1.5" opacity="0.45" />

        <polygon points="10,8.5 10,15.5 17,12" fill="#F4C542" opacity="0.5" />

        <line x1="2" y1="8"  x2="5" y2="8"  stroke="#F4C542" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
        <line x1="2" y1="12" x2="5" y2="12" stroke="#F4C542" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
        <line x1="2" y1="16" x2="5" y2="16" stroke="#F4C542" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />

        <line x1="19" y1="8"  x2="22" y2="8"  stroke="#F4C542" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
        <line x1="19" y1="12" x2="22" y2="12" stroke="#F4C542" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
        <line x1="19" y1="16" x2="22" y2="16" stroke="#F4C542" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
      </svg>
      <span className="card__no-poster-label">No Poster</span>
    </div>
  )
}

export default function MovieCard({ movie }: Props) {
  const navigate = useNavigate()

  const [imgError, setImgError] = useState(false)

  const [showPreview, setShowPreview] = useState(false)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const hoverTimer = useRef<number | null>(null)

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

  const detailPath = movie.type === 'tv' ? `/show/tv/${movie.id}` : `/player/movie/${movie.id}`

  function stopAndRun(e: MouseEvent, fn: () => void) {
    e.stopPropagation()
    fn()
  }

  return (
    <article
      className={`card${showPreview ? ' card--expanded' : ''}`}
      onClick={() => navigate(movie.type === 'tv' ? `/show/tv/${movie.id}` : `/player/movie/${movie.id}`)}
      aria-label={movie.type === 'tv' ? `See episodes for ${movie.title}` : `Play ${movie.title}`}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(movie.type === 'tv' ? `/show/tv/${movie.id}` : `/player/movie/${movie.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      {imgError ? (
        <NoPoster />
      ) : (
        <img
          className="card__poster"
          src={movie.poster}

          srcSet={posterSrcSet(movie.poster)}
          sizes={POSTER_SIZES}
          alt={movie.title}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}

      {showPreview && trailerKey && (
        <TrailerPreview
          trailerKey={trailerKey}
          className="card__trailer"
          hiddenClassName="card__trailer--hidden"
          controlsClassName="card__preview-controls"
        />
      )}

      {!(showPreview && trailerKey) && (
        <span className="card__badge">
          {movie.type === 'tv' ? 'TV' : 'FILM'}
        </span>
      )}

      {!showPreview && (
        <div className="card__info">
          <p className="card__title">{movie.title}</p>
          <div className="card__meta">
            <span className="card__rating">★ {movie.rating}</span>
            <span className="card__year">{movie.year}</span>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="card__hover-panel">
          <p className="card__hover-title">{movie.title}</p>
          <div className="card__hover-meta">
            <span className="card__rating">★ {movie.rating}</span>
            <span className="card__year">{movie.year}</span>
            <span className="card__hover-genre">{movie.genres[0]}</span>
          </div>
          <div className="card__hover-actions">
            <button
              className="card__hover-btn card__hover-btn--play"
              aria-label={`Play ${movie.title}`}
              onClick={e => stopAndRun(e, () => navigate(detailPath))}
            >
              ▶
            </button>
            <button
              className="card__hover-btn"
              aria-label="Add to My List"
              onClick={e => stopAndRun(e, () => {})}
            >
              +
            </button>
            <button
              className="card__hover-btn"
              aria-label="Like"
              onClick={e => stopAndRun(e, () => {})}
            >

              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7 22h11.5a2 2 0 0 0 1.95-1.57l1.4-6.5A2 2 0 0 0 19.9 11.5H14l.9-4.6a2 2 0 0 0-3.5-1.6L7 10.5V22Z"
                  stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
                />
                <path d="M3 22V10.5h4V22H3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className="card__hover-btn card__hover-btn--more"
              aria-label={`More info about ${movie.title}`}
              onClick={e => stopAndRun(e, () => navigate(detailPath))}
            >
              ⌄
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
