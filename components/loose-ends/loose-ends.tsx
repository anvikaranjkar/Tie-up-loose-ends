'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GameProvider, useGame } from './store'
import { AudioProvider } from './audio'
import { CinematicOverlay } from './effects'
import { IntroScreen } from './screens/intro-screen'
import { ApartmentScreen } from './screens/apartment-screen'
import { DesktopScreen } from './screens/desktop-screen'
import { PlatformScreen } from './screens/platform-screen'
import { EndingScreen } from './screens/ending-screen'
import { MEDIA } from '@/lib/loose-ends/data'

// Heavy imagery that benefits from being warm before the first scene renders.
const PRELOAD = [MEDIA.roomBg, MEDIA.wallpaper, MEDIA.deathCertificate]

/** CRT-style boot screen shown while key assets warm up (max ~2.4s). */
function BootLoader({ onReady }: { onReady: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let done = 0
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      onReady()
    }
    const bump = () => {
      done += 1
      setProgress(Math.round((done / PRELOAD.length) * 100))
      if (done >= PRELOAD.length) window.setTimeout(finish, 350)
    }
    PRELOAD.forEach((src) => {
      const img = new Image()
      img.onload = bump
      img.onerror = bump // resilient: a missing asset still advances the loader
      img.src = src
    })
    // Safety net so the loader never traps the player.
    const cap = window.setTimeout(finish, 2400)
    return () => window.clearTimeout(cap)
  }, [onReady])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-black"
    >
      <p className="font-type text-2xl tracking-[0.3em] text-paper/90">FINAL FAREWELL</p>
      <div className="h-1 w-56 overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full bg-amber-soft" animate={{ width: `${Math.max(8, progress)}%` }} transition={{ ease: 'easeOut' }} />
      </div>
      <p className="font-serif text-xs uppercase tracking-[0.3em] text-paper/40">Loading&hellip;</p>
    </motion.div>
  )
}

function CurrentScreen() {
  const { screen } = useGame()

  const screens: Record<string, React.ReactNode> = {
    intro: <IntroScreen />,
    apartment: <ApartmentScreen />,
    desktop: <DesktopScreen />,
    platform: <PlatformScreen />,
    final: <EndingScreen />,
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0, filter: 'blur(12px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(12px)' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 overflow-y-auto"
      >
        {screens[screen]}
      </motion.div>
    </AnimatePresence>
  )
}

export function LooseEnds() {
  const [ready, setReady] = useState(false)
  return (
    <GameProvider>
      <AudioProvider>
        <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
          <AnimatePresence>{!ready && <BootLoader key="boot" onReady={() => setReady(true)} />}</AnimatePresence>
          <CurrentScreen />
          <CinematicOverlay />
        </div>
      </AudioProvider>
    </GameProvider>
  )
}
