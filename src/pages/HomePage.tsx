import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import MovieRow from '../components/MovieRow'
import TopTenRow from '../components/TopTenRow'
import * as tmdb from '../api/tmdb'
import type { Movie } from '../types'

export default function HomePage() {
  const [trending, setTrending] = useState<Movie[]>([])
  const [movies,   setMovies]   = useState<Movie[]>([])
  const [tvShows,  setTvShows]  = useState<Movie[]>([])
  const [anime,    setAnime]    = useState<Movie[]>([])
  const [kdrama,   setKdrama]   = useState<Movie[]>([])
  const [sciFi,    setSciFi]    = useState<Movie[]>([])
  const [action,   setAction]   = useState<Movie[]>([])
  const [romance,  setRomance]  = useState<Movie[]>([])
  const [animation,setAnimation]= useState<Movie[]>([])

  useEffect(() => {
    tmdb.fetchTrending().then(setTrending)
    tmdb.fetchMovies().then(setMovies)
    tmdb.fetchTVShows().then(setTvShows)
    tmdb.fetchAnime().then(setAnime)
    tmdb.fetchKDrama().then(setKdrama)
    tmdb.fetchSciFi().then(setSciFi)
    tmdb.fetchAction().then(setAction)
    tmdb.fetchRomance().then(setRomance)
    tmdb.fetchAnimation().then(setAnimation)
  }, [])

  const featured = trending[0]

  return (
    <>
      <Navbar />

      {featured && <HeroSection movie={featured} />}

      <main className="home-main">
        <TopTenRow title="Top 10 Trending Today" movies={trending} id="trending" />
        <MovieRow title="Movies"              movies={movies}    id="movies" />
        <MovieRow title="TV Shows"            movies={tvShows}   id="tvshows" />
        <MovieRow title="Anime"               movies={anime}     id="anime" />
        <MovieRow title="K-Drama"             movies={kdrama}    id="kdrama" />
        <MovieRow title="Sci-Fi & Fantasy"    movies={sciFi}     id="scifi" />
        <MovieRow title="Action & Adventure"  movies={action}    id="action" />
        <MovieRow title="Romance"             movies={romance}   id="romance" />
        <MovieRow title="Animation"           movies={animation} id="animation" />
      </main>

      <footer className="footer">
        <p>LuckVue · Data from TMDB</p>
      </footer>
    </>
  )
}
