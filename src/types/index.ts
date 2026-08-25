export type MediaType = 'movie' | 'tv'

export interface Episode {
  id:          number
  number:      number
  title:       string
  overview:    string
  still:       string
  runtime:     number
  airDate:     string
}

export interface Season {
  number:   number
  name:     string
  episodes: Episode[]
  poster:   string
}

export interface Movie {
  id:          number
  title:       string
  year:        number
  rating:      string
  type:        MediaType
  genres:      string[]
  poster:      string
  backdrop:    string
  description: string
}
