import { useEffect, useRef, useState } from 'react'
import type { MediaType } from '../types'
import {
  PROVIDERS,
  getProvider,
  loadProviderId,
  saveProviderId,
} from '../api/players'

interface Props {
  id: number
  type: MediaType
  season?: number
  episode?: number
}

export default function VideoPlayer({ id, type, season = 1, episode = 1 }: Props) {
  const progressKey = `cv_progress_${type}_${id}_${season}_${episode}`

  const [loading, setLoading] = useState(true)

  const [providerId, setProviderId] = useState(loadProviderId)

  const [menuOpen, setMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  const provider = getProvider(providerId)

  useEffect(() => {
    setLoading(true)
  }, [id, type, season, episode, providerId])

  useEffect(() => {
    if (!menuOpen) return

    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const saved = localStorage.getItem(progressKey)
  const resume = saved && parseFloat(saved) > 10
    ? Math.floor(parseFloat(saved))
    : null

  const src = provider.build({ id, type, season, episode, resume })

  function switchServer(nextId: string) {
    setProviderId(nextId)
    saveProviderId(nextId)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!provider.sendsProgress) return

    function onMessage(event: MessageEvent) {
      if (!event.origin.includes(provider.host)) return

      let payload: { event?: string; currentTime?: number } | null = null

      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data)
          payload = parsed?.data ?? parsed
        } catch { return }
      } else if (event.data?.type === 'PLAYER_EVENT') {
        payload = event.data.data
      } else if (event.data?.type === 'MEDIA_DATA') {
        return
      }

      if (!payload?.event) return

      if (payload.event === 'timeupdate' && (payload.currentTime ?? 0) > 10) {
        localStorage.setItem(progressKey, String(payload.currentTime))
      }
      if (payload.event === 'ended') {
        localStorage.removeItem(progressKey)
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [progressKey, provider])

  return (
    <div className="player__wrapper">
      {loading && (
        <div className="player__loading">
          <div className="player__loading-spinner" />
          <span className="player__loading-text">Loading player…</span>
        </div>
      )}

      <div className="player__title-mask" aria-hidden="true" />

      <div className="player__servers" ref={menuRef}>
        <button
          className={`player__servers-toggle${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen(open => !open)}
          aria-expanded={menuOpen}
          aria-haspopup="true"
          title="Video not working? Switch server"
        >
          <svg
            className="player__servers-icon"
            viewBox="0 0 24 24" width="15" height="15" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
            aria-hidden="true"
          >
            <rect x="3" y="4"  width="18" height="7" rx="2" />
            <rect x="3" y="13" width="18" height="7" rx="2" />
            <line x1="7" y1="7.5"  x2="7.01" y2="7.5" />
            <line x1="7" y1="16.5" x2="7.01" y2="16.5" />
          </svg>
          <span>{provider.name}</span>
        </button>

        {menuOpen && (
          <div className="player__servers-menu">
            <p className="player__servers-label">
              Video not working? Try another server:
            </p>
            {PROVIDERS.map(p => (
              <button
                key={p.id}
                className={`player__server${p.id === provider.id ? ' player__server--active' : ''}`}
                onClick={() => switchServer(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <iframe
        key={provider.id}
        src={src}
        title={`${provider.name} video player`}
        style={{ border: 'none' }}
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        referrerPolicy="no-referrer"
        onLoad={() => setLoading(false)}
      />
    </div>
  )
}
