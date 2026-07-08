'use client'

import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { useGame } from '../store'
import { cn } from '@/lib/utils'

export function StressMeter({ className }: { className?: string }) {
  const { fatigue: stress } = useGame()
  const color =
    stress < 40 ? 'var(--crt)' : stress < 75 ? 'var(--amber)' : 'var(--destructive)'
  const label = stress < 40 ? 'Coping' : stress < 75 ? 'Strained' : 'Overwhelmed'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Activity className="size-3.5 shrink-0" style={{ color }} />
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-crt text-xs leading-none tracking-wider text-paper/80 uppercase">
            Admin Fatigue
          </span>
          <span className="font-crt text-xs leading-none" style={{ color }}>
            {label}
          </span>
        </div>
        <div className="h-2 w-36 overflow-hidden rounded-full bg-black/40">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            animate={{ width: `${stress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>
    </div>
  )
}
