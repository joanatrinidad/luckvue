import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { searchTMDB } from '../api/tmdb'
import type { Movie } from '../types'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  const [query, setQuery] = useState('')

  const [results, setResults] = useState<Movie[]>([])

  const [menuOpen, setMenuOpen] = useState(false)

  const [searchOpen, setSearchOpen] = useState(false)

  const navigate  = useNavigate()
  const location  = useLocation()

  const searchRef = useRef<HTMLDivElement>(null)

  const navRef    = useRef<HTMLElement>(null)

  const inputRef  = useRef<HTMLInputElement>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const isPlayerPage = location.pathname.startsWith('/player')

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        clearSearch()
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    function handleOutsideTap(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideTap)
    return () => document.removeEventListener('mousedown', handleOutsideTap)
  }, [menuOpen])

  function clearSearch() {
    setQuery('')
    setResults([])
    setSearchOpen(false)
  }

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  function toggleMenu() {
    setMenuOpen(open => !open)
    clearSearch()
  }

  function toggleSearch() {
    setMenuOpen(false)
    if (searchOpen) clearSearch()
    else setSearchOpen(true)
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)

    clearTimeout(debounceRef.current)

    if (q.trim().length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(() => {
      searchTMDB(q).then(setResults)
    }, 400)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') clearSearch()
  }

  const navClass = `navbar${scrolled || isPlayerPage ? ' navbar--dark' : ''}`

  return (
    <nav className={navClass} ref={navRef}>
      <div className="navbar__left">

        <button
          className={`navbar__toggle${menuOpen ? ' navbar__toggle--open' : ''}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>

        <Link to="/" className="navbar__logo">
          LUCK
          <img src="/logo.png" alt="" className="navbar__logo-mark" />
          <span>VUE</span>
        </Link>
        <ul className="navbar__links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/category/latest">Latest</Link></li>
          <li><Link to="/category/popular">Popular</Link></li>
          <li className="navbar__more">
            <button className="navbar__more-btn">More ▾</button>
            <div className="navbar__more-dropdown">
              <span className="navbar__more-heading">Genres</span>
              <Link to="/category/movies"    className="navbar__more-item">Movies</Link>
              <Link to="/category/tvshows"   className="navbar__more-item">TV Shows</Link>
              <Link to="/category/anime"     className="navbar__more-item">Anime</Link>
              <Link to="/category/kdrama"    className="navbar__more-item">K-Drama</Link>
              <Link to="/category/scifi"     className="navbar__more-item">Sci-Fi</Link>
              <Link to="/category/action"    className="navbar__more-item">Action</Link>
              <Link to="/category/romance"   className="navbar__more-item">Romance</Link>
              <Link to="/category/animation" className="navbar__more-item">Animation</Link>
            </div>
          </li>
        </ul>
      </div>

      <div className={`navbar__right${searchOpen ? ' navbar__right--open' : ''}`} ref={searchRef}>
        <input
          ref={inputRef}
          className="navbar__search"
          type="text"
          placeholder="Search titles or genres…"
          value={query}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          aria-label="Search"
        />

        <button
          className={`navbar__search-btn${searchOpen ? ' navbar__search-btn--open' : ''}`}
          onClick={toggleSearch}
          aria-label={searchOpen ? 'Close search' : 'Open search'}
          aria-expanded={searchOpen}
        >

          {searchOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          )}
        </button>

        {results.length > 0 && (
          <div className="navbar__dropdown" role="listbox">

            {results.map(movie => (
              <div
                key={movie.id}
                className="navbar__result"
                role="option"
                onClick={() => {
                  navigate(movie.type === 'tv' ? `/show/tv/${movie.id}` : `/player/movie/${movie.id}`)
                  clearSearch()
                }}
              >
                <img src={movie.poster} alt={movie.title} loading="lazy" />
                <div className="navbar__result-info">
                  <span className="navbar__result-title">{movie.title}</span>
                  <span className="navbar__result-meta">
                    {movie.year} · {movie.type === 'tv' ? 'TV Show' : 'Movie'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`navbar__mobile${menuOpen ? ' navbar__mobile--open' : ''}`}>
        <Link to="/"                 className="navbar__mobile-item">Home</Link>
        <Link to="/category/latest"  className="navbar__mobile-item">Latest</Link>
        <Link to="/category/popular" className="navbar__mobile-item">Popular</Link>

        <span className="navbar__mobile-heading">Genres</span>
        <div className="navbar__mobile-genres">

          {[
            ['movies',    'Movies'],
            ['tvshows',   'TV Shows'],
            ['anime',     'Anime'],
            ['kdrama',    'K-Drama'],
            ['scifi',     'Sci-Fi'],
            ['action',    'Action'],
            ['romance',   'Romance'],
            ['animation', 'Animation'],
          ].map(([slug, label]) => (
            <Link key={slug} to={`/category/${slug}`} className="navbar__mobile-genre">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
