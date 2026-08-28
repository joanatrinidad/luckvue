import { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ShowPageSkeleton } from '../components/Skeleton'
import { fetchById, fetchShowSeasons } from '../api/tmdb'
import { backdropSrcSet, stillSrcSet } from '../api/images'
import type { Movie, Season } from '../types'

export default function ShowPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [show,         setShow]         = useState<Movie | null>(null)
  const [seasons,      setSeasons]      = useState<Season[]>([])
  const [activeSeason, setActiveSeason] = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(false)

  useEffect(() => {
    const numId = parseInt(id ?? '0')
    if (!numId) { setError(true); setLoading(false); return }

    Promise.all([
      fetchById(numId, 'tv'),
      fetchShowSeasons(numId),
    ]).then(([showData, seasonData]) => {
      if (!showData) { setError(true) }
      else {
        setShow(showData)
        document.title = `${showData.title} — LuckVue`
      }
      setSeasons(seasonData)
      if (seasonData.length > 0) setActiveSeason(seasonData[0].number)
      setLoading(false)
    })

    return () => { document.title = 'LuckVue' }
  }, [id])

  if (loading) return (
    <>
      <Navbar />
      <ShowPageSkeleton />
    </>
  )

  if (error || !show) return <Navigate to="/" replace />

  const currentSeason = seasons.find(s => s.number === activeSeason)
  const episodes = currentSeason?.episodes ?? []

  function playEpisode(seasonNum: number, episodeNum: number) {
    navigate(`/player/tv/${id}?season=${seasonNum}&episode=${episodeNum}`)
  }

  return (
    <>
      <Navbar />

      <div className="show-backdrop">

        {show.backdrop && (
          <img
            className="show-backdrop__img"
            src={show.backdrop}
            srcSet={backdropSrcSet(show.backdrop)}
            sizes="100vw"
            alt=""
            aria-hidden="true"
          />
        )}
        <div className="show-backdrop__overlay" />
        <div className="show-backdrop__content">
          <h1 className="show-backdrop__title">{show.title}</h1>
          <div className="show-backdrop__meta">
            <span className="show-backdrop__rating">★ {show.rating}</span>
            <span>·</span>
            <span>{show.year}</span>
            {show.genres.slice(0, 2).map(g => (
              <><span key={g}>·</span><span>{g}</span></>
            ))}
          </div>
          <p className="show-backdrop__desc">{show.description}</p>
          <div className="show-backdrop__actions">
            <button
              className="show-backdrop__btn show-backdrop__btn--play"
              onClick={() => playEpisode(1, 1)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Play
            </button>
            <button className="show-backdrop__btn show-backdrop__btn--outline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Watchlist
            </button>
          </div>
        </div>
      </div>

      <main className="show-episodes">
        <div className="show-episodes__heading">
          <h2 className="show-episodes__label">Episodes</h2>
          <div className="show-episodes__tabs">
            {seasons.map(s => (
              <button
                key={s.number}
                className={`show-tab${s.number === activeSeason ? ' show-tab--active' : ''}`}
                onClick={() => setActiveSeason(s.number)}
              >
                {s.name || `Season ${s.number}`}
              </button>
            ))}
          </div>
        </div>

        {episodes.length === 0 ? (
          <p className="show-episodes__empty">No episodes found for this season.</p>
        ) : (
          <div className="episodes-grid">
            {episodes.map(ep => (
              <button
                key={ep.id}
                className="ep-card"
                onClick={() => playEpisode(activeSeason, ep.number)}
              >
                <div className="ep-card__thumb">
                  {ep.still ? (
                    <img
                      src={ep.still}
                      srcSet={stillSrcSet(ep.still)}

                      sizes="(max-width: 560px) 100vw, 140px"
                      alt={ep.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="ep-card__no-thumb">▶</div>
                  )}
                </div>

                <div className="ep-card__info">
                  <span className="ep-card__num">E{ep.number}</span>
                  <p className="ep-card__title">{ep.title}</p>
                  {ep.runtime > 0 && (
                    <span className="ep-card__runtime">{ep.runtime} min</span>
                  )}
                  {ep.overview && (
                    <p className="ep-card__overview">{ep.overview}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
