import type { Movie, MediaType, Season, Episode } from '../types'

const BASE = 'https://api.themoviedb.org/3'

const TOKEN = import.meta.env.VITE_TMDB_TOKEN as string

const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action',    12: 'Adventure',  16: 'Animation', 35: 'Comedy',
  80: 'Crime',     18: 'Drama',      14: 'Fantasy',   27: 'Horror',
  10749: 'Romance', 878: 'Sci-Fi',   53: 'Thriller',  37: 'Western',
  10759: 'Action', 10765: 'Sci-Fi',  10762: 'Kids',   99: 'Documentary',
}

interface TMDBItem {
  id: number
  title?: string
  name?: string
  media_type?: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  genre_ids: number[]
  origin_country?: string[]
}

async function get(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE}${path}`)

  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), { headers: HEADERS })
  if (!res.ok) throw new Error(`TMDB error ${res.status} on ${path}`)

  const json = await res.json() as { results: TMDBItem[] }
  return json.results ?? []
}

function toMovie(item: TMDBItem, fallbackType: MediaType = 'movie'): Movie {
  const type: MediaType =
    item.media_type === 'movie' || item.media_type === 'tv'
      ? item.media_type
      : fallbackType

  const dateStr = type === 'movie' ? item.release_date : item.first_air_date
  const year = parseInt(dateStr?.slice(0, 4) ?? '0') || 0

  const genres = item.genre_ids
    .map(id => GENRE_MAP[id])
    .filter(Boolean)
    .slice(0, 3) as string[]

  if (item.origin_country?.includes('JP') && item.genre_ids.includes(16)) {
    if (!genres.includes('Anime')) genres.unshift('Anime')
  }
  if (item.origin_country?.includes('KR')) {
    if (!genres.includes('K-Drama')) genres.unshift('K-Drama')
  }

  return {
    id: item.id,
    title: item.title ?? item.name ?? 'Unknown',
    year,
    rating: item.vote_average.toFixed(1),
    type,
    genres: genres.length ? genres : ['Drama'],
    poster: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : '',
    backdrop: item.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
      : '',
    description: item.overview,
  }
}

export async function fetchTrending(): Promise<Movie[]> {
  const items = await get('/trending/all/week')
  return items
    .filter(i => i.media_type === 'movie' || i.media_type === 'tv')
    .map(i => toMovie(i))
}

export async function fetchMovies(): Promise<Movie[]> {
  const items = await get('/movie/popular')
  return items.map(i => toMovie(i, 'movie'))
}

export async function fetchTVShows(): Promise<Movie[]> {
  const items = await get('/tv/popular')
  return items
    .map(i => toMovie(i, 'tv'))
    .filter(m => !m.genres.includes('Anime') && !m.genres.includes('K-Drama'))
}

export async function fetchAnime(): Promise<Movie[]> {
  const items = await get('/discover/tv', {
    with_genres: '16',
    with_origin_country: 'JP',
    sort_by: 'popularity.desc',
  })
  return items.map(i => {
    const m = toMovie(i, 'tv')
    if (!m.genres.includes('Anime')) m.genres.unshift('Anime')
    return m
  })
}

export async function fetchKDrama(): Promise<Movie[]> {
  const items = await get('/discover/tv', {
    with_origin_country: 'KR',
    sort_by: 'popularity.desc',
  })
  return items.map(i => {
    const m = toMovie(i, 'tv')
    if (!m.genres.includes('K-Drama')) m.genres.unshift('K-Drama')
    return m
  })
}

export async function fetchSciFi(): Promise<Movie[]> {
  const [movies, shows] = await Promise.all([
    get('/discover/movie', { with_genres: '878', sort_by: 'popularity.desc' }),
    get('/discover/tv',    { with_genres: '10765', sort_by: 'popularity.desc' }),
  ])
  return [
    ...movies.map(i => toMovie(i, 'movie')),
    ...shows.map(i => toMovie(i, 'tv')),
  ].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
}

export async function fetchAction(): Promise<Movie[]> {
  const [movies, shows] = await Promise.all([
    get('/discover/movie', { with_genres: '28', sort_by: 'popularity.desc' }),
    get('/discover/tv',    { with_genres: '10759', sort_by: 'popularity.desc' }),
  ])
  return [
    ...movies.map(i => toMovie(i, 'movie')),
    ...shows.map(i => toMovie(i, 'tv')),
  ]
}

export async function fetchRomance(): Promise<Movie[]> {
  const [movies, shows] = await Promise.all([
    get('/discover/movie', { with_genres: '10749', sort_by: 'popularity.desc' }),
    get('/discover/tv',    { with_genres: '10749', sort_by: 'popularity.desc' }),
  ])
  return [
    ...movies.map(i => toMovie(i, 'movie')),
    ...shows.map(i => toMovie(i, 'tv')),
  ]
}

export async function fetchAnimation(): Promise<Movie[]> {
  const items = await get('/discover/movie', {
    with_genres: '16',
    sort_by: 'popularity.desc',
  })
  return items
    .filter(i => !i.origin_country?.includes('JP'))
    .map(i => toMovie(i, 'movie'))
}

export async function fetchLatest(): Promise<Movie[]> {
  const [movies, shows] = await Promise.all([
    get('/movie/now_playing', { sort_by: 'popularity.desc' }),
    get('/tv/on_the_air',     { sort_by: 'popularity.desc' }),
  ])
  return [
    ...movies.map(i => toMovie(i, 'movie')),
    ...shows.map(i => toMovie(i, 'tv')),
  ]
}

export async function fetchPopular(): Promise<Movie[]> {
  const [movies, shows] = await Promise.all([
    get('/movie/popular'),
    get('/tv/popular'),
  ])
  return [
    ...movies.map(i => toMovie(i, 'movie')),
    ...shows.map(i => toMovie(i, 'tv')),
  ]
}

export async function fetchById(id: number, type: MediaType): Promise<Movie | null> {
  try {
    const res = await fetch(`${BASE}/${type}/${id}`, { headers: HEADERS })
    if (!res.ok) return null
    const item = await res.json() as TMDBItem & { genres?: { id: number; name: string }[] }

    const genreNames = item.genres?.map(g => g.name).slice(0, 3) ?? []
    const dateStr = type === 'movie' ? item.release_date : item.first_air_date
    const year = parseInt(dateStr?.slice(0, 4) ?? '0') || 0

    return {
      id: item.id,
      title: item.title ?? item.name ?? 'Unknown',
      year,
      rating: item.vote_average.toFixed(1),
      type,
      genres: genreNames.length ? genreNames : ['Drama'],
      poster: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : '',
      backdrop: item.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
        : '',
      description: item.overview,
    }
  } catch {
    return null
  }
}

export async function fetchShowSeasons(id: number): Promise<Season[]> {
  try {
    const res = await fetch(`${BASE}/tv/${id}`, { headers: HEADERS })
    if (!res.ok) return []
    const show = await res.json() as {
      seasons: { season_number: number; name: string; episode_count: number; poster_path: string | null }[]
    }

    const realSeasons = show.seasons.filter(s => s.season_number > 0)

    const results = await Promise.all(
      realSeasons.map(async s => {
        const r = await fetch(`${BASE}/tv/${id}/season/${s.season_number}`, { headers: HEADERS })
        if (!r.ok) return null
        const data = await r.json() as {
          episodes: {
            id: number
            episode_number: number
            name: string
            overview: string
            still_path: string | null
            runtime: number | null
            air_date: string
          }[]
        }

        const episodes: Episode[] = data.episodes.map(ep => ({
          id:       ep.id,
          number:   ep.episode_number,
          title:    ep.name,
          overview: ep.overview,
          still:    ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : '',
          runtime:  ep.runtime ?? 0,
          airDate:  ep.air_date,
        }))

        const season: Season = {
          number:   s.season_number,
          name:     s.name,
          episodes,
          poster:   s.poster_path ? `https://image.tmdb.org/t/p/w300${s.poster_path}` : '',
        }
        return season
      })
    )

    return results.filter((s): s is Season => s !== null)
  } catch {
    return []
  }
}

export async function fetchTrailerKey(id: number, type: MediaType): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/${type}/${id}/videos`, { headers: HEADERS })
    if (!res.ok) return null
    const data = await res.json() as {
      results: { key: string; site: string; type: string; official: boolean }[]
    }

    const youtube = data.results.filter(v => v.site === 'YouTube')
    const trailer =
      youtube.find(v => v.type === 'Trailer' && v.official) ??
      youtube.find(v => v.type === 'Trailer') ??
      youtube.find(v => v.type === 'Teaser') ??
      youtube[0]

    return trailer?.key ?? null
  } catch {
    return null
  }
}

export async function searchTMDB(query: string): Promise<Movie[]> {
  if (query.trim().length < 2) return []
  const items = await get('/search/multi', { query, include_adult: 'false' })
  return items
    .filter(i => i.media_type === 'movie' || i.media_type === 'tv')
    .map(i => toMovie(i))
    .slice(0, 6)
}
