import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  children:   ReactNode
  className?: string
}

export default function RowTrack({ children, className = '' }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function updateArrows() {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    updateArrows()

    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)

    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [])

  useEffect(updateArrows)

  function scroll(direction: 1 | -1) {
    const el = trackRef.current
    if (!el) return

    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <div className="row__viewport">
      {canScrollLeft && (
        <button
          className="row__arrow row__arrow--left"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
        >
          ‹
        </button>
      )}

      <div ref={trackRef} className={`row__track ${className}`.trim()}>
        {children}
      </div>

      {canScrollRight && (
        <button
          className="row__arrow row__arrow--right"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
        >
          ›
        </button>
      )}
    </div>
  )
}
