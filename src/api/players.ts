import type { MediaType } from '../types'

export interface PlayerProvider {
  id:    string
  name:  string
  host:  string

  build: (o: BuildOptions) => string

  sendsProgress?: boolean
}

export interface BuildOptions {
  id:      number
  type:    MediaType
  season:  number
  episode: number
  resume:  number | null
}

export const PROVIDERS: PlayerProvider[] = [
  {
    id:   'vidking',
    name: 'Server 1',
    host: 'vidking.net',
    sendsProgress: true,
    build: ({ id, type, season, episode, resume }) => {
      const base = type === 'movie'
        ? `https://www.vidking.net/embed/movie/${id}`
        : `https://www.vidking.net/embed/tv/${id}/${season}/${episode}`
      const params = new URLSearchParams({ color: 'F4C542', autoPlay: 'true' })
      if (type === 'tv') {
        params.set('nextEpisode', 'true')
        params.set('episodeSelector', 'true')
      }
      if (resume) params.set('progress', String(resume))
      return `${base}?${params}`
    },
  },
  {
    id:   'vidlink',
    name: 'Server 2',
    host: 'vidlink.pro',
    sendsProgress: true,
    build: ({ id, type, season, episode }) => {
      const base = type === 'movie'
        ? `https://vidlink.pro/movie/${id}`
        : `https://vidlink.pro/tv/${id}/${season}/${episode}`

      return `${base}?primaryColor=F4C542&autoplay=true&nextbutton=true`
    },
  },
  {
    id:   'vidsrccc',
    name: 'Server 3',
    host: 'vidsrc.cc',
    build: ({ id, type, season, episode }) =>
      type === 'movie'
        ? `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`
        : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}?autoPlay=true`,
  },
  {
    id:   'embedsu',
    name: 'Server 4',
    host: 'embed.su',
    build: ({ id, type, season, episode }) =>
      type === 'movie'
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id:   'vidsrcxyz',
    name: 'Server 5',
    host: 'vidsrc.xyz',
    build: ({ id, type, season, episode }) =>
      type === 'movie'
        ? `https://vidsrc.xyz/embed/movie?tmdb=${id}`
        : `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  },
]

export const DEFAULT_PROVIDER = 'vidking'

const STORAGE_KEY = 'cv_provider'

export function getProvider(id: string | null): PlayerProvider {
  return PROVIDERS.find(p => p.id === id) ?? PROVIDERS[0]
}

export function loadProviderId(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PROVIDER
}

export function saveProviderId(id: string) {
  localStorage.setItem(STORAGE_KEY, id)
}
