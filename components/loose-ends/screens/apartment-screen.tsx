'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, FileText, Search, X } from 'lucide-react'
import Image from 'next/image'
import { CLUES, HOTSPOTS, MEDIA, STORY, type Hotspot } from '@/lib/loose-ends/data'
import { DustParticles, Rain } from '../effects'
import { useGame } from '../store'
import { useAudio } from '../audio'
import { CertificateViewer } from '../ui/certificate-viewer'

// Soft guidance shown once as the player enters; each line fades on its own.
const GUIDANCE = [
  'Maybe there\u2019s something useful on the desk.',
  'That photograph looks like it means something.',
  'The laptop will need a password to unlock.',
]

export function ApartmentScreen() {
  const { clues, collect, goto, totalClues, hasClue } = useGame()
  const audio = useAudio()
  const [active, setActive] = useState<Hotspot | null>(null)
  const [certOpen, setCertOpen] = useState(false)
  const [tooEarly, setTooEarly] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)
  const [hintsDone, setHintsDone] = useState(false)

  // Play the door on entry, then walk through the guidance lines and retire
  // them. Any clue found early also dismisses the guidance.
  useEffect(() => {
    audio.play('door')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (hintsDone) return
    if (clues.length > 0) {
      setHintsDone(true)
      return
    }
    if (hintIndex >= GUIDANCE.length) {
      setHintsDone(true)
      return
    }
    const id = window.setTimeout(() => setHintIndex((i) => i + 1), 3800)
    return () => window.clearTimeout(id)
  }, [hintIndex, hintsDone, clues.length])

  function openHotspot(h: Hotspot) {
    audio.play('drawer')
    setActive(h)
    if (h.clueId) collect(h.clueId)
  }

  function goToComputer() {
    if (clues.length < 3) {
      setTooEarly(true)
      window.setTimeout(() => setTooEarly(false), 2600)
      return
    }
    goto('desktop')
  }

  const found = clues.filter((c) => CLUES[c])

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Scene */}
      <motion.div className="absolute inset-0" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.6, ease: 'easeOut' }}>
        <Image
          src={MEDIA.roomBg || '/placeholder.svg'}
          alt="John's apartment at night"
          fill
          priority
          className="object-cover [image-rendering:pixelated]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,transparent_18%,rgba(0,0,0,0.6))]" />
      </motion.div>
      <Rain count={44} className="opacity-30" />
      <DustParticles count={18} />

      {/* Hotspots */}
      {HOTSPOTS.map((h, i) => {
        const done = h.clueId ? hasClue(h.clueId) : false
        return (
          <motion.button
            key={h.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            onClick={() => {
              if (h.id === 'envelope') {
                openHotspot(h)
                setCertOpen(true)
              } else if (h.id === 'computer') {
                goToComputer()
              } else {
                openHotspot(h)
              }
            }}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            aria-label={h.label}
          >
            <span className="relative flex size-9 items-center justify-center">
              {!done && <span className="absolute inline-flex size-9 animate-ping rounded-full bg-amber/25 [animation-duration:2.6s]" />}
              <span
                className={`relative grid size-8 place-items-center rounded-full border backdrop-blur-sm transition-all group-hover:scale-110 ${
                  done ? 'border-crt/60 bg-crt/20 text-crt' : 'border-amber/70 bg-black/40 text-amber'
                }`}
              >
                {done ? <Check className="size-4" /> : h.id === 'computer' ? <span className="font-crt text-xs">PC</span> : <Search className="size-4" />}
              </span>
            </span>
            <span className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 font-serif text-xs text-paper opacity-0 transition-opacity group-hover:opacity-100">
              {h.label}
            </span>
          </motion.button>
        )
      })}

      {/* Header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-1 bg-gradient-to-b from-black/70 to-transparent px-4 pb-10 pt-5 text-center">
        <p className="font-type text-sm uppercase tracking-[0.3em] text-amber-soft">{STORY.deceased.name}&apos;s Apartment</p>
        <p className="font-hand text-lg text-paper/80">Search the room. Everything he left behind means something.</p>
      </div>

      {/* Fading entry guidance */}
      <AnimatePresence mode="wait">
        {!hintsDone && hintIndex < GUIDANCE.length && (
          <motion.div
            key={hintIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute left-1/2 top-28 z-10 -translate-x-1/2 rounded-full border border-amber/30 bg-black/60 px-5 py-2 text-center font-hand text-lg text-amber-soft backdrop-blur"
          >
            {GUIDANCE[hintIndex]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evidence tray + CTA */}
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
        <div className="max-w-md rounded-lg border border-border/60 bg-black/60 p-3 backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-type text-xs uppercase tracking-widest text-paper/80">Evidence</span>
            <span className="font-crt text-sm text-amber-soft">
              {found.length}/{totalClues}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(CLUES).map((c) => {
              const got = hasClue(c.id)
              return (
                <span key={c.id} className={`rounded px-2 py-1 font-serif text-xs transition-colors ${got ? 'bg-crt/20 text-crt' : 'bg-white/5 text-paper/30'}`}>
                  {got ? c.title : '???'}
                </span>
              )
            })}
          </div>
        </div>

        <button
          onClick={goToComputer}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 font-type text-sm transition-all ${
            clues.length >= 3 ? 'border-crt/60 bg-crt/15 text-crt hover:bg-crt/25 animate-gentle-pulse' : 'border-border/50 bg-black/50 text-paper/50'
          }`}
        >
          <FileText className="size-4" />
          Use his computer
        </button>
      </div>

      {/* Too-early nudge */}
      <AnimatePresence>
        {tooEarly && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-24 right-4 max-w-xs rounded-lg border border-amber/40 bg-black/80 p-3 text-right font-hand text-base text-amber-soft backdrop-blur"
          >
            You don&apos;t know his passwords yet. Search a little more first.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail / clue modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16, rotate: -1, opacity: 0 }}
              animate={{ scale: 1, y: 0, rotate: -1, opacity: 1 }}
              exit={{ scale: 0.92, y: 16, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="paper-shadow relative w-full max-w-md rounded-md bg-paper p-6 text-ink"
            >
              <div className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 bg-amber/40" />
              <button onClick={() => setActive(null)} className="absolute right-3 top-3 grid size-7 place-items-center rounded-full text-ink/50 hover:bg-ink/10" aria-label="Close">
                <X className="size-4" />
              </button>
              <p className="font-type text-xs uppercase tracking-widest text-ink/60">{active.label}</p>
              <p className="mt-3 font-serif text-base leading-relaxed text-ink/90">{active.detail}</p>

              {active.clueId && CLUES[active.clueId] && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4 rounded border border-rust/30 bg-paper-2 p-3">
                  <p className="font-hand text-lg leading-snug text-ink/80">{CLUES[active.clueId].note}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Check className="size-3.5 text-rust" />
                    <span className="font-type text-xs uppercase tracking-wider text-rust">
                      Learned &mdash; {CLUES[active.clueId].title}: <b>{CLUES[active.clueId].value}</b>
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CertificateViewer open={certOpen} onClose={() => setCertOpen(false)} />
    </div>
  )
}
