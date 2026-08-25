import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Navigate, useNavigate } from 'react-router-dom'
import VideoPlayer from '../components/VideoPlayer'
import { fetchById } from '../api/tmdb'
import type { Movie, MediaType } from '../types'

export default function PlayerPage() {
  const { type, id } = useParams<{ type: string; id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const season  = parseInt(searchParams.get('season')  ?? '1') || 1
  const episode = parseInt(searchParams.get('episode') ?? '1') || 1

  const [movie,   setMovie]   = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setMovie(null)

    const numId = parseInt(id ?? '0')
    const mediaType = type as MediaType

    if (!numId || (type !== 'movie' && type !== 'tv')) {
      setError(true)
      setLoading(false)
      return
    }

    fetchById(numId, mediaType).then(data => {
      if (data) {
        setMovie(data)
        document.title = `${data.title} — LuckVue`
      } else {
        setError(true)
      }
      setLoading(false)
    })

    return () => { document.title = 'LuckVue' }
  }, [id, type])

  function goBack() {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate('/')
  }

  const backButton = (
    <button className="player__back" onClick={goBack} aria-label="Go back">
      <span className="player__back-arrow" aria-hidden="true">←</span>
      <span className="player__back-text">Back</span>
    </button>
  )

  if (loading) return (
    <main className="player-page">{backButton}</main>
  )

  if (error || !movie) return <Navigate to="/" replace />

  return (
    <main className="player-page">
      {backButton}
      <VideoPlayer id={movie.id} type={movie.type} season={season} episode={episode} />
    </main>
  )
}
