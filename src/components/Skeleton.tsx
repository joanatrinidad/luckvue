import type { CSSProperties, ReactNode } from 'react'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  radius?: string | number
  style?: CSSProperties
}

/** Base shimmer block. Everything below is composed from it. */
export default function Skeleton({ className = '', width, height, radius, style }: SkeletonProps) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      aria-hidden="true"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

/** Wraps a group of blocks so screen readers announce a single busy region. */
function Busy({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className} role="status" aria-busy="true" aria-live="polite">
      <span className="skeleton-sr">{label}</span>
      {children}
    </div>
  )
}

/** One poster placeholder, same footprint as <MovieCard />. */
export function CardSkeleton() {
  return <Skeleton className="skeleton--card" />
}

/** Poster row placeholder — mirrors <MovieRow /> / <TopTenRow />. */
export function RowSkeleton({ title, count = 8, top10 = false }: { title: string; count?: number; top10?: boolean }) {
  return (
    <Busy label={`Loading ${title}`} className={`row${top10 ? ' top10' : ''} row--skeleton`}>
      <h2 className="row__title">{title}</h2>
      <div className="skeleton-track">
        {Array.from({ length: count }, (_, i) =>
          top10 ? (
            <div className="top10__item" key={i}>
              <span className="top10__rank" aria-hidden="true">{i + 1}</span>
              <CardSkeleton />
            </div>
          ) : (
            <CardSkeleton key={i} />
          )
        )}
      </div>
    </Busy>
  )
}

/** Grid placeholder for <CategoryPage />. */
export function GridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <Busy label="Loading titles" className="category-page__grid">
      {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
    </Busy>
  )
}

/** Hero placeholder — matches <HeroSection /> layout. */
export function HeroSkeleton() {
  return (
    <Busy label="Loading featured title" className="hero hero--skeleton">
      <div className="hero__overlay" />
      <div className="skeleton-hero__content">
        <Skeleton height={20} width="30%" radius={4} />
        <Skeleton className="skeleton-hero__title" height={56} width="80%" radius={8} />
        <Skeleton height={14} width="95%" radius={4} />
        <Skeleton height={14} width="88%" radius={4} />
        <Skeleton height={14} width="60%" radius={4} />
        <div className="skeleton-hero__actions">
          <Skeleton height={46} width={150} radius={999} />
          <Skeleton height={46} width={150} radius={999} />
        </div>
      </div>
    </Busy>
  )
}

/** Full <ShowPage /> placeholder: backdrop block + season tabs + episode list. */
export function ShowPageSkeleton({ episodes = 6 }: { episodes?: number }) {
  return (
    <Busy label="Loading episodes" className="show-page-skeleton">
      <div className="show-backdrop show-backdrop--skeleton">
        <div className="show-backdrop__content">
          <Skeleton className="skeleton-show__title" height={56} width="70%" radius={8} />
          <Skeleton height={16} width="45%" radius={4} />
          <Skeleton className="skeleton-show__desc" height={13} width="100%" radius={4} />
          <Skeleton height={13} width="92%" radius={4} />
          <Skeleton height={13} width="64%" radius={4} />
          <div className="skeleton-show__actions">
            <Skeleton height={44} width={160} radius={999} />
            <Skeleton height={44} width={130} radius={999} />
          </div>
        </div>
      </div>

      <div className="show-episodes">
        <div className="show-episodes__heading">
          <Skeleton height={26} width={190} radius={4} />
          <div className="show-episodes__tabs">
            {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} height={32} width={92} radius={999} />)}
          </div>
        </div>

        <div className="episodes-grid">
          {Array.from({ length: episodes }, (_, i) => (
            <div className="ep-card ep-card--skeleton" key={i}>
              <Skeleton className="skeleton-ep__thumb" />
              <div className="ep-card__info">
                <Skeleton height={11} width={80} radius={3} />
                <Skeleton height={16} width="55%" radius={4} />
                <Skeleton height={11} width={64} radius={3} />
                <Skeleton height={11} width="90%" radius={3} />
                <Skeleton height={11} width="72%" radius={3} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Busy>
  )
}

/** Placeholder for the player surface while the title is being resolved. */
export function PlayerSkeleton() {
  return (
    <Busy label="Loading player" className="player__wrapper player__wrapper--skeleton">
      <Skeleton className="skeleton-player__stage" />
    </Busy>
  )
}
