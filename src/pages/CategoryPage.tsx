import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MovieCard from '../components/MovieCard'
import * as tmdb from '../api/tmdb'
import type { Movie } from '../types'

const CATEGORIES: Record<string, { label: string; fetch: () => Promise<Movie[]> }> = {
  latest:     { label: 'Latest',            fetch: tmdb.fetchLatest },
  popular:    { label: 'Popular',           fetch: tmdb.fetchPopular },
  movies:     { label: 'Movies',            fetch: tmdb.fetchMovies },
  tvshows:    { label: 'TV Shows',          fetch: tmdb.fetchTVShows },
  anime:      { label: 'Anime',             fetch: tmdb.fetchAnime },
  kdrama:     { label: 'K-Drama',           fetch: tmdb.fetchKDrama },
  scifi:      { label: 'Sci-Fi & Fantasy',  fetch: tmdb.fetchSciFi },
  action:     { label: 'Action & Adventure',fetch: tmdb.fetchAction },
  romance:    { label: 'Romance',           fetch: tmdb.fetchRomance },
  animation:  { label: 'Animation',         fetch: tmdb.fetchAnimation },
}

export default function CategoryPage() {
  const { name } = useParams<{ name: string }>()
  const category = name ? CATEGORIES[name] : undefined
  const [items, setItems] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!category) return
    setLoading(true)
    category.fetch().then(data => {
      setItems(data)
      setLoading(false)
    })
  }, [name])

  if (!category) {
    return (
      <>
        <Navbar />
        <main className="category-page">
          <div className="category-page__empty">
            <h1>Category not found</h1>
            <Link to="/">Go back home</Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="category-page">
        <div className="category-page__header">
          <Link to="/" className="category-page__back">← Back</Link>
          <h1 className="category-page__title">
            {category.label}
          </h1>
          <span className="category-page__count">{items.length} titles</span>
        </div>

        {loading ? (
          <div className="category-page__loading">Loading…</div>
        ) : (
          <div className="category-page__grid">
            {items.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
