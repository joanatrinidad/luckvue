import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import MovieRow from '../components/MovieRow'
import TopTenRow from '../components/TopTenRow'
import { HeroSkeleton } from '../components/Skeleton'
import * as tmdb from '../api/tmdb'
import type { Movie } from '../types'

/** Fetches one category and reports whether it is still in flight. */
function useCategory(fetcher: () => Promise<Movie[]>) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetcher()
      .then(data => { if (alive) setMovies(data) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return { movies, loading }
}

export default function HomePage() {
  const trending  = useCategory(tmdb.fetchTrending)
  const movies    = useCategory(tmdb.fetchMovies)
  const tvShows   = useCategory(tmdb.fetchTVShows)
  const anime     = useCategory(tmdb.fetchAnime)
  const kdrama    = useCategory(tmdb.fetchKDrama)
  const sciFi     = useCategory(tmdb.fetchSciFi)
  const action    = useCategory(tmdb.fetchAction)
  const romance   = useCategory(tmdb.fetchRomance)
  const animation = useCategory(tmdb.fetchAnimation)

  const featured = trending.movies[0]

  return (
    <>
      <Navbar />

      {featured
        ? <HeroSection movie={featured} />
        : trending.loading && <HeroSkeleton />}

      <main className="home-main">
        <TopTenRow title="Top 10 Trending Today" movies={trending.movies}  loading={trending.loading}  id="trending" />
        <MovieRow title="Movies"              movies={movies.movies}    loading={movies.loading}    id="movies" />
        <MovieRow title="TV Shows"            movies={tvShows.movies}   loading={tvShows.loading}   id="tvshows" />
        <MovieRow title="Anime"               movies={anime.movies}     loading={anime.loading}     id="anime" />
        <MovieRow title="K-Drama"             movies={kdrama.movies}    loading={kdrama.loading}    id="kdrama" />
        <MovieRow title="Sci-Fi & Fantasy"    movies={sciFi.movies}     loading={sciFi.loading}     id="scifi" />
        <MovieRow title="Action & Adventure"  movies={action.movies}    loading={action.loading}    id="action" />
        <MovieRow title="Romance"             movies={romance.movies}   loading={romance.loading}   id="romance" />
        <MovieRow title="Animation"           movies={animation.movies} loading={animation.loading} id="animation" />
      </main>

      <footer className="footer">
        <p>LuckVue · Data from TMDB</p>
      </footer>
    </>
  )
}
