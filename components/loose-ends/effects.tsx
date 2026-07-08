'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

/** Only render children after mount — avoids SSR/CSR mismatch for random visuals. */
function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

/** Floating dust motes drifting up through light. Pure CSS, GPU-friendly. */
export function DustParticles({ count = 26, className }: { count?: number; className?: string }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 1 + Math.random() * 3,
        duration: 14 + Math.random() * 22,
        delay: Math.random() * -30,
        drift: `${(Math.random() - 0.5) * 120}px`,
        opacity: 0.25 + Math.random() * 0.5,
      })),
    [count],
  )

  const mounted = useMounted()
  if (!mounted) return null

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {motes.map((m) => (
        <span
          key={m.id}
          className="absolute bottom-0 rounded-full bg-lamp"
          style={{
            left: `${m.left}%`,
            width: m.size,
            height: m.size,
            // @ts-expect-error custom props
            '--dust-drift': m.drift,
            '--dust-opacity': m.opacity,
            animation: `float-dust ${m.duration}s linear ${m.delay}s infinite`,
            filter: 'blur(0.4px)',
          }}
        />
      ))}
    </div>
  )
}

/** Diagonal rain, used behind windows. */
export function Rain({ count = 90, className }: { count?: number; className?: string }) {
  const drops = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 0.5 + Math.random() * 0.7,
        delay: Math.random() * -2,
        height: 30 + Math.random() * 60,
        opacity: 0.1 + Math.random() * 0.25,
      })),
    [count],
  )
  const mounted = useMounted()
  if (!mounted) return null
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {drops.map((d) => (
        <span
          key={d.id}
          className="absolute top-0 w-px bg-gradient-to-b from-transparent via-dust-blue to-transparent"
          style={{
            left: `${d.left}%`,
            height: d.height,
            opacity: d.opacity,
            transform: 'rotate(12deg)',
            animation: `rain-fall ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/** Standalone film-grain layer, scoped to its nearest positioned parent. */
export function FilmGrain({ className }: { className?: string }) {
  return <div className={cn('film-grain pointer-events-none absolute inset-0 z-[60]', className)} aria-hidden="true" />
}

/** Standalone vignette layer, scoped to its nearest positioned parent. */
export function Vignette({ className }: { className?: string }) {
  return <div className={cn('vignette pointer-events-none absolute inset-0 z-[60]', className)} aria-hidden="true" />
}

/** Full-screen cinematic wrapper: film grain, vignette, optional scanlines. */
export function CinematicOverlay({ scanlines = false }: { scanlines?: boolean }) {
  return (
    <>
      <div className="film-grain vignette pointer-events-none fixed inset-0 z-[9990]" aria-hidden="true" />
      {scanlines && (
        <div className="scanlines crt-flicker pointer-events-none fixed inset-0 z-[9991]" aria-hidden="true" />
      )}
    </>
  )
}
