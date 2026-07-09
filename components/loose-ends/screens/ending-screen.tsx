'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../store'
import { Logo } from '../logo'
import { FilmGrain, Vignette } from '../effects'

const LINES = [
  'John Citizen is at rest.',
  'His accounts are closed. His subscriptions cancelled.',
  'The photos, the messages, the small digital rooms he lived in \u2014 all quietly put away.',
  'There is nothing left online to answer to.',
  'Only the people who loved him remain.',
]

export function EndingScreen() {
  const { reset } = useGame()
  const [revealed, setRevealed] = useState(1)

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-center">
      <FilmGrain />
      <Vignette />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4 }}
        className="relative z-10 flex max-w-xl flex-col items-center gap-8"
      >
        <Logo className="h-10 opacity-80" />

        <div className="flex flex-col gap-5">
          {LINES.slice(0, revealed).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: i === revealed - 1 ? 0.92 : 0.55 }}
              transition={{ duration: 1.6 }}
              className="text-pretty font-serif text-lg leading-relaxed text-foreground"
            >
              {line}
            </motion.p>
          ))}
        </div>

        {revealed < LINES.length ? (
          <button
            onClick={() => setRevealed((r) => r + 1)}
            className="mt-2 rounded-full border border-border/60 px-6 py-2 font-serif text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Continue
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="mt-4 flex flex-col items-center gap-6"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Thank you for tying up his loose ends
            </p>
            <button
              onClick={reset}
              className="rounded-full bg-primary px-8 py-2.5 font-serif text-sm text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Play again
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
