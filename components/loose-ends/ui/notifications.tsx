'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Phone, X } from 'lucide-react'
import { NOTIFICATIONS } from '@/lib/loose-ends/data'
import { useGame } from '../store'

type Toast = { id: number; title: string; body: string }

/**
 * Administrative Fatigue made visible. The higher the fatigue, the faster
 * notifications arrive and the more stack up at once — the desktop literally
 * fills with unfinished business.
 */
export function Notifications() {
  const { fatigue } = useGame()
  const [toasts, setToasts] = useState<Toast[]>([])

  // spawn cadence scales with fatigue (faster when overwhelmed)
  useEffect(() => {
    if (fatigue < 12) return
    const interval = Math.max(1400, 5200 - fatigue * 42)
    const id = window.setInterval(() => {
      const n = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)]
      const toast = { id: Date.now() + Math.random(), ...n }
      const max = Math.min(6, 1 + Math.floor(fatigue / 18))
      setToasts((prev) => [toast, ...prev].slice(0, max))
      // auto-dismiss
      window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), 6500)
    }, interval)
    return () => window.clearInterval(id)
  }, [fatigue])

  return (
    <>
      {/* ringing phone at high fatigue */}
      <AnimatePresence>
        {fatigue >= 65 && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="absolute bottom-16 left-4 z-[60] flex items-center gap-3 rounded-lg border border-destructive/50 bg-black/80 px-4 py-3 backdrop-blur"
          >
            <motion.span animate={{ rotate: [0, -18, 18, -12, 12, 0] }} transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.4 }}>
              <Phone className="size-5 text-destructive" />
            </motion.span>
            <div>
              <p className="font-type text-xs text-paper">Incoming call</p>
              <p className="font-serif text-xs text-paper/60">Unknown &mdash; probably another department</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* notification stack */}
      <div className="pointer-events-none absolute bottom-16 right-4 z-[60] flex w-72 flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="pointer-events-auto overflow-hidden rounded-lg border border-border bg-card/95 shadow-xl backdrop-blur"
            >
              <div className="flex items-start gap-2 p-3">
                <Bell className="mt-0.5 size-4 shrink-0 text-amber" />
                <div className="min-w-0 flex-1">
                  <p className="font-type text-xs text-foreground">{t.title}</p>
                  <p className="font-serif text-xs leading-snug text-muted-foreground">{t.body}</p>
                </div>
                <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="text-muted-foreground hover:text-foreground" aria-label="Dismiss">
                  <X className="size-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
