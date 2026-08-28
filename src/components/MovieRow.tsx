import { useEffect, useRef, useState } from 'react'
import MovieCard from './MovieCard'
import RowTrack from './RowTrack'
import { RowSkeleton } from './Skeleton'
import type { Movie } from '../types'

interface Props {
  title: string
  movies: Movie[]
  id?: string
  loading?: boolean
}

export default function MovieRow({ title, movies, id, loading = false }: Props) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (loading && movies.length === 0) return <RowSkeleton title={title} />

  if (movies.length === 0) return null

  return (
    <section
      ref={ref}
      className={`row${visible ? ' row--visible' : ''}`}
      id={id}
    >
      <h2 className="row__title">{title}</h2>
      <RowTrack>
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </RowTrack>
    </section>
  )
}
