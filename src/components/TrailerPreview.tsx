import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<void> | null = null

function loadYouTubeAPI(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()

  if (apiPromise) return apiPromise

  apiPromise = new Promise<void>(resolve => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })

  return apiPromise
}

interface Props {
  trailerKey:        string
  className:         string
  hiddenClassName:   string
  controlsClassName: string
}

export default function TrailerPreview({
  trailerKey,
  className,
  hiddenClassName,
  controlsClassName,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null)

  const playerRef = useRef<any>(null)

  const [playerState, setPlayerState] = useState(-1)
  const [isMuted, setIsMuted] = useState(true)
  const isPlaying = playerState === 1

  useEffect(() => {
    let cancelled = false

    loadYouTubeAPI().then(() => {
      if (cancelled || !hostRef.current) return

      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId: trailerKey,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
        },
        events: {
          onReady: (e: any) => {
            e.target.mute()
            e.target.playVideo()
          },

          onStateChange: (e: any) => {
            setPlayerState(e.data)
            if (e.data === 0) e.target.playVideo()
          },
        },
      })
    })

    return () => {
      cancelled = true
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [trailerKey])

  function handlePause(e: React.MouseEvent) {
    e.stopPropagation()
    if (isPlaying) playerRef.current?.pauseVideo?.()
    else playerRef.current?.playVideo?.()
  }

  function handleMute(e: React.MouseEvent) {
    e.stopPropagation()
    if (isMuted) playerRef.current?.unMute?.()
    else playerRef.current?.mute?.()
    setIsMuted(m => !m)
  }

  return (
    <>
      <div className={`${className}${isPlaying ? '' : ` ${hiddenClassName}`}`}>
        <div ref={hostRef} className="trailer-preview__host" />
      </div>

      <div className={controlsClassName}>
        <button
          className="card__mute-btn"
          aria-label={isPlaying ? 'Pause preview' : 'Resume preview'}
          onClick={handlePause}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button
          className="card__mute-btn"
          aria-label={isMuted ? 'Unmute preview' : 'Mute preview'}
          onClick={handleMute}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </>
  )
}
