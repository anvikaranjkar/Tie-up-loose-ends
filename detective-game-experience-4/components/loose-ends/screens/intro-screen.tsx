'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Play, RotateCcw, SkipForward } from 'lucide-react'
import { Rain, DustParticles } from '../effects'
import { useGame } from '../store'
import { useAudio } from '../audio'

// ---------------------------------------------------------------------------
// Cinematic onboarding. Six paced slides the player can move through, go back
// in, or skip entirely. Rain persists across every slide; the background tint
// and ambient treatment shift slide to slide so nothing feels abrupt.
// ---------------------------------------------------------------------------

type Slide = {
  id: string
  kind: 'title' | 'story'
  title?: string
  subtitle?: string
  lines?: { text: string; strong?: boolean }[]
  tint: string // radial-gradient accent colour
  dust?: boolean
}

const SLIDES: Slide[] = [
  {
    id: 'title',
    kind: 'title',
    title: 'FINAL FAREWELL',
    subtitle: 'The hardest part of losing someone isn\u2019t always saying goodbye.',
    tint: 'rgba(70,90,120,0.28)',
    dust: true,
  },
  {
    id: 'passing',
    kind: 'story',
    lines: [
      { text: '1 May 2019', strong: true },
      { text: 'John Citizen passed away.' },
      { text: 'The funeral has ended.' },
      { text: 'But nobody prepared his family for what came next.' },
    ],
    tint: 'rgba(90,70,60,0.26)',
  },
  {
    id: 'emma',
    kind: 'story',
    lines: [
      { text: 'You are Emma Citizen.', strong: true },
      { text: 'John\u2019s daughter.' },
      { text: 'Your job is to organise every part of his digital life.' },
      { text: 'Banks. Government. Insurance. Utilities. Social media. Passwords. Subscriptions. Everything.' },
    ],
    tint: 'rgba(60,90,90,0.24)',
  },
  {
    id: 'chaos',
    kind: 'story',
    lines: [
      { text: 'Nothing has been cancelled.', strong: true },
      { text: 'Bills continue arriving.' },
      { text: 'Subscriptions continue charging.' },
      { text: 'Friends continue commenting online. The accounts remain active.' },
      { text: 'You don\u2019t even know where to begin.' },
    ],
    tint: 'rgba(100,60,60,0.26)',
  },
  {
    id: 'plan',
    kind: 'story',
    lines: [
      { text: 'Search John\u2019s apartment.', strong: true },
      { text: 'Collect clues. Recover passwords.' },
      { text: 'Unlock his computer and piece together his digital life.' },
      { text: 'Maybe\u2026 there\u2019s a better way to do all of this.' },
    ],
    tint: 'rgba(70,95,80,0.24)',
    dust: true,
  },
  {
    id: 'begin',
    kind: 'title',
    title: 'FINAL FAREWELL',
    subtitle: 'A short interactive story about the paperwork of grief.',
    tint: 'rgba(70,90,120,0.3)',
    dust: true,
  },
]

function SlideBody({ slide }: { slide: Slide }) {
  if (slide.kind === 'title') {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <motion.h1
          initial={{ opacity: 0, letterSpacing: '0.5em', filter: 'blur(8px)' }}
          animate={{ opacity: 1, letterSpacing: '0.18em', filter: 'blur(0px)' }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-type text-4xl text-paper drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-6xl"
        >
          {slide.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="max-w-xl text-balance font-serif text-lg italic text-paper/70 sm:text-xl"
        >
          {slide.subtitle}
        </motion.p>
      </div>
    )
  }

  return (
    <div className="flex max-w-2xl flex-col items-center gap-5 px-6 text-center">
      {slide.lines?.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + i * 0.55, duration: 0.9, ease: 'easeOut' }}
          className={
            line.strong
              ? 'text-balance font-type text-2xl tracking-wide text-amber-soft sm:text-3xl'
              : 'text-balance font-serif text-lg leading-relaxed text-paper/80 sm:text-xl'
          }
        >
          {line.text}
        </motion.p>
      ))}
    </div>
  )
}

export function IntroScreen() {
  const { goto, hydrated, hasSave, continueSaved, restart } = useGame()
  const audio = useAudio()
  // menu shows only when a resumable save exists; otherwise dive into slides.
  const [phase, setPhase] = useState<'menu' | 'slides'>('slides')
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)

  useEffect(() => {
    if (hydrated && hasSave) setPhase('menu')
  }, [hydrated, hasSave])

  const slide = SLIDES[index]
  const isFirst = index === 0
  const isLast = index === SLIDES.length - 1

  const next = useCallback(() => {
    audio.play('click')
    if (isLast) {
      audio.play('door')
      goto('apartment')
      return
    }
    setDir(1)
    setIndex((i) => Math.min(SLIDES.length - 1, i + 1))
  }, [audio, goto, isLast])

  const prev = useCallback(() => {
    if (isFirst) return
    audio.play('click')
    setDir(-1)
    setIndex((i) => Math.max(0, i - 1))
  }, [audio, isFirst])

  const skip = useCallback(() => {
    audio.play('door')
    goto('apartment')
  }, [audio, goto])

  // Keyboard navigation while in the slide sequence.
  useEffect(() => {
    if (phase !== 'slides') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        skip()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, next, prev, skip])

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
      {/* Ambient rain persists across the whole onboarding */}
      <Rain count={70} className="opacity-40" />
      {slide?.dust && <DustParticles count={16} />}

      {/* Shifting background tint per slide */}
      <motion.div
        key={`tint-${slide?.id ?? phase}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 42%, ${slide?.tint ?? 'rgba(70,90,120,0.28)'}, transparent 60%)` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.9))]" />

      {/* ---- Main menu (only when a save exists) ---- */}
      <AnimatePresence mode="wait">
        {phase === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col items-center gap-8 px-8 text-center"
          >
            <motion.h1
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, letterSpacing: '0.18em' }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="font-type text-4xl text-paper drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-5xl"
            >
              FINAL FAREWELL
            </motion.h1>
            <p className="font-serif text-sm uppercase tracking-[0.35em] text-paper/50">Welcome back, Emma</p>
            <div className="flex flex-col items-stretch gap-3">
              <button
                onClick={() => {
                  audio.play('click')
                  continueSaved()
                }}
                className="group flex items-center justify-center gap-2 rounded-full border border-crt/50 bg-crt/15 px-8 py-3 font-type text-sm uppercase tracking-[0.2em] text-crt transition-colors hover:bg-crt/25"
              >
                <Play className="size-4" /> Continue Investigation
              </button>
              <button
                onClick={() => {
                  audio.play('click')
                  restart()
                  setPhase('slides')
                  setIndex(0)
                }}
                className="flex items-center justify-center gap-2 rounded-full border border-border/50 bg-black/40 px-8 py-3 font-serif text-sm uppercase tracking-[0.2em] text-paper/60 transition-colors hover:text-paper"
              >
                <RotateCcw className="size-4" /> Restart Investigation
              </button>
            </div>
          </motion.div>
        )}

        {/* ---- Slide sequence ---- */}
        {phase === 'slides' && (
          <motion.div key={`slide-${slide.id}`} className="relative z-10 flex w-full flex-col items-center justify-center">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={slide.id}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: dir * -60, filter: 'blur(8px)' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex w-full items-center justify-center"
              >
                <SlideBody slide={slide} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Navigation controls ---- */}
      {phase === 'slides' && (
        <>
          {/* progress dots */}
          <div className="absolute left-1/2 top-8 z-20 flex -translate-x-1/2 gap-2">
            {SLIDES.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-amber-soft' : 'w-1.5 bg-paper/25'}`}
              />
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-8 z-20 flex items-center justify-center gap-3 px-6">
            <button
              onClick={prev}
              disabled={isFirst}
              className="flex items-center gap-2 rounded-full border border-border/50 bg-black/50 px-5 py-2.5 font-serif text-sm text-paper/70 backdrop-blur transition-all hover:text-paper disabled:pointer-events-none disabled:opacity-25"
            >
              <ArrowLeft className="size-4" /> Previous
            </button>

            <button
              onClick={next}
              className="group flex items-center gap-2 rounded-full border border-amber/40 bg-amber/10 px-7 py-2.5 font-type text-sm uppercase tracking-[0.15em] text-amber-soft backdrop-blur transition-colors hover:bg-amber/20"
            >
              {isLast ? (
                <>
                  Begin Investigation <Play className="size-4 transition-transform group-hover:translate-x-0.5" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <button
              onClick={skip}
              className="flex items-center gap-2 rounded-full border border-border/40 bg-black/40 px-5 py-2.5 font-serif text-sm text-paper/50 backdrop-blur transition-colors hover:text-paper/80"
            >
              Skip <SkipForward className="size-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
