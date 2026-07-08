'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'

/**
 * Lightweight, deployment-safe audio layer.
 *
 * The actual audio files are optional — drop them into
 * /public/final-farewell/audio/ later and they'll start playing automatically.
 * Until then every call fails silently, so the experience never breaks.
 *
 * Nothing autoplays: the ambient loop only begins after the first real user
 * gesture, satisfying browser autoplay policies.
 */

export type SfxName =
  | 'click'
  | 'drawer'
  | 'keyboard'
  | 'notify'
  | 'startup'
  | 'folder'
  | 'door'
  | 'piano'

const SFX_SRC: Record<SfxName, string> = {
  click: '/final-farewell/audio/click.mp3',
  drawer: '/final-farewell/audio/drawer.mp3',
  keyboard: '/final-farewell/audio/keyboard.mp3',
  notify: '/final-farewell/audio/notify.mp3',
  startup: '/final-farewell/audio/startup.mp3',
  folder: '/final-farewell/audio/folder.mp3',
  door: '/final-farewell/audio/door.mp3',
  piano: '/final-farewell/audio/piano.mp3',
}

const AMBIENCE_SRC = '/final-farewell/audio/rain-loop.mp3'
const PREFS_KEY = 'final-farewell:audio:v1'

type AudioApi = {
  muted: boolean
  volume: number // 0..1, master volume
  setMuted: (m: boolean) => void
  toggleMuted: () => void
  setVolume: (v: number) => void
  play: (name: SfxName, opts?: { volume?: number }) => void
}

const AudioContext = createContext<AudioApi | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMutedState] = useState(false)
  const [volume, setVolumeState] = useState(0.6)
  const [ready, setReady] = useState(false)

  const cache = useRef<Map<SfxName, HTMLAudioElement>>(new Map())
  const ambience = useRef<HTMLAudioElement | null>(null)
  const startedAmbience = useRef(false)

  // Restore saved preferences on the client.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFS_KEY)
      if (raw) {
        const p = JSON.parse(raw) as { muted?: boolean; volume?: number }
        if (typeof p.muted === 'boolean') setMutedState(p.muted)
        if (typeof p.volume === 'number') setVolumeState(p.volume)
      }
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  // Persist preferences.
  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify({ muted, volume }))
    } catch {
      /* ignore */
    }
  }, [muted, volume, ready])

  // Keep the ambient loop in sync with mute/volume.
  useEffect(() => {
    const el = ambience.current
    if (!el) return
    el.volume = muted ? 0 : Math.min(1, volume * 0.4)
  }, [muted, volume])

  // Start the ambient rain loop after the first user gesture.
  useEffect(() => {
    if (typeof window === 'undefined') return
    function begin() {
      if (startedAmbience.current) return
      startedAmbience.current = true
      try {
        const el = new Audio(AMBIENCE_SRC)
        el.loop = true
        el.volume = muted ? 0 : Math.min(1, volume * 0.4)
        el.play().catch(() => {
          /* file missing or blocked — ignore */
        })
        ambience.current = el
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('pointerdown', begin, { once: true })
    window.addEventListener('keydown', begin, { once: true })
    return () => {
      window.removeEventListener('pointerdown', begin)
      window.removeEventListener('keydown', begin)
    }
  }, [muted, volume])

  const play = useCallback(
    (name: SfxName, opts?: { volume?: number }) => {
      if (muted) return
      try {
        let el = cache.current.get(name)
        if (!el) {
          el = new Audio(SFX_SRC[name])
          cache.current.set(name, el)
        }
        el.currentTime = 0
        el.volume = Math.min(1, volume * (opts?.volume ?? 1))
        el.play().catch(() => {
          /* file missing or blocked — ignore */
        })
      } catch {
        /* ignore */
      }
    },
    [muted, volume],
  )

  const setMuted = useCallback((m: boolean) => setMutedState(m), [])
  const toggleMuted = useCallback(() => setMutedState((m) => !m), [])
  const setVolume = useCallback((v: number) => setVolumeState(Math.max(0, Math.min(1, v))), [])

  const api = useMemo<AudioApi>(
    () => ({ muted, volume, setMuted, toggleMuted, setVolume, play }),
    [muted, volume, setMuted, toggleMuted, setVolume, play],
  )

  return <AudioContext.Provider value={api}>{children}</AudioContext.Provider>
}

export function useAudio() {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}

/** Floating mute/volume control, fixed to a screen corner. */
export function AudioControl() {
  const { muted, toggleMuted, volume, setVolume } = useAudio()
  const [open, setOpen] = useState(false)

  return (
    <div
      className="fixed bottom-4 right-4 z-[9995] flex items-center gap-2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 96 }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden rounded-full border border-border/60 bg-black/70 px-3 py-2 backdrop-blur"
          >
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              aria-label="Volume"
              className="h-1 w-full cursor-pointer accent-[var(--amber,#e0b64a)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={toggleMuted}
        aria-label={muted ? 'Unmute' : 'Mute'}
        className="grid size-10 place-items-center rounded-full border border-border/60 bg-black/70 text-paper/80 backdrop-blur transition-transform hover:scale-105 active:scale-95"
      >
        {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
      </button>
    </div>
  )
}
