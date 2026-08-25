const POSTER_WIDTHS   = [154, 185, 342, 500] as const
const BACKDROP_WIDTHS = [780, 1280] as const
const STILL_WIDTHS    = [185, 300] as const

const HERO_POSTER_WIDTHS = [342, 500, 780] as const

const TMDB_SIZE = /\/t\/p\/w\d+\//

function atWidth(url: string, width: number): string {
  return url.replace(TMDB_SIZE, `/t/p/w${width}/`)
}

function buildSrcSet(url: string, widths: readonly number[]): string {
  if (!url || !TMDB_SIZE.test(url)) return ''
  return widths.map(w => `${atWidth(url, w)} ${w}w`).join(', ')
}

export const posterSrcSet   = (url: string) => buildSrcSet(url, POSTER_WIDTHS)
export const backdropSrcSet = (url: string) => buildSrcSet(url, BACKDROP_WIDTHS)
export const stillSrcSet    = (url: string) => buildSrcSet(url, STILL_WIDTHS)
export const heroPosterSrcSet = (url: string) => buildSrcSet(url, HERO_POSTER_WIDTHS)

export const POSTER_SIZES = [
  '(max-width: 400px) 104px',
  '(max-width: 560px) 116px',
  '(max-width: 768px) 130px',
  '158px',
].join(', ')
