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

export default function TopTenRow({ title, movies, id, loading = false }: Props) {
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

  if (loading && movies.length === 0) return <RowSkeleton title={title} count={10} top10 />

  if (movies.length === 0) return null

  return (
    <section
      ref={ref}
      className={`row top10${visible ? ' row--visible' : ''}`}
      id={id}
    >
      <h2 className="row__title">{title}</h2>

      <RowTrack className="top10__track">

        {movies.slice(0, 10).map((movie, index) => (
          <div className="top10__item" key={movie.id}>

            <span className="top10__rank" aria-hidden="true">
              {index + 1}
            </span>
            <MovieCard movie={movie} />
          </div>
        ))}
      </RowTrack>
    </section>
  )
}
