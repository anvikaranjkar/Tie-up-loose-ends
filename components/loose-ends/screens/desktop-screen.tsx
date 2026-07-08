'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Banknote,
  Clapperboard,
  CreditCard,
  FileText,
  FolderOpen,
  Camera,
  HelpCircle,
  Landmark,
  Mail,
  MessagesSquare,
  Plug,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Image from 'next/image'
import { ACCOUNTS, CLUES, DESKTOP_APPS, MEDIA } from '@/lib/loose-ends/data'
import { useClock } from '../use-clock'
import { useGame } from '../store'
import { RetroWindow } from '../ui/window'
import { AccountWindow } from '../ui/account-window'
import { EvidenceFolder, EvidencePreview } from '../ui/evidence'
import { AssistantWindow } from '../ui/assistant'
import { Notifications } from '../ui/notifications'
import { StressMeter } from '../ui/stress-meter'
import { WindowManagerProvider, type WindowManager } from '../ui/window-manager'

const ICONS: Record<string, React.ElementType> = {
  Mail,
  Clapperboard,
  Instagram: Camera,
  Landmark,
  ShieldCheck,
  FileText,
  MessagesSquare,
  Banknote,
  CreditCard,
  Plug,
  FolderOpen,
  Sparkles,
}

function Icon({ name, className }: { name: string; className?: string }) {
  const C = ICONS[name] ?? FileText
  return <C className={className} />
}

type WinMeta = {
  title: string
  icon: string
  accent: string
  width: number
  height: number
  node: React.ReactNode
}

/** Resolve a window id to its chrome + content. Supports accounts, the two
 *  desktop apps, and per-clue evidence previews (id `clue:<id>`). */
function resolveWindow(id: string): WinMeta | null {
  if (id.startsWith('clue:')) {
    const clue = CLUES[id.slice(5)]
    if (!clue) return null
    return {
      title: clue.fileName,
      icon: 'FileText',
      accent: '#b0873a',
      width: 440,
      height: 500,
      node: <EvidencePreview clueId={clue.id} />,
    }
  }
  if (id === 'evidence') {
    return { title: 'Investigation Evidence', icon: 'FolderOpen', accent: '#c99b34', width: 540, height: 440, node: <EvidenceFolder /> }
  }
  if (id === 'assistant') {
    return { title: 'Estate Investigation Assistant', icon: 'Sparkles', accent: '#5e93ab', width: 400, height: 540, node: <AssistantWindow /> }
  }
  const account = ACCOUNTS.find((a) => a.id === id)
  if (!account) return null
  const size =
    account.kind === 'instagram' || account.id === 'instagram'
      ? { w: 440, h: 600 }
      : account.id === 'netflix'
        ? { w: 560, h: 520 }
        : account.kind === 'chat'
          ? { w: 440, h: 520 }
          : account.kind === 'file'
            ? { w: 520, h: 380 }
            : { w: 440, h: 460 }
  return {
    title: account.label,
    icon: account.icon,
    accent: account.brand,
    width: size.w,
    height: size.h,
    node: <AccountWindow account={account} />,
  }
}

export function DesktopScreen() {
  const { goto, solved, fatigue } = useGame()
  const clock = useClock()
  const [openIds, setOpenIds] = useState<string[]>([])
  const [minimized, setMinimized] = useState<string[]>([])
  const [order, setOrder] = useState<string[]>([])
  const [helpStage, setHelpStage] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    const t1 = window.setTimeout(() => setHelpStage((s) => (s < 1 ? 1 : s)), 35000)
    const t2 = window.setTimeout(() => setHelpStage(2), 70000)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  useEffect(() => {
    if (fatigue >= 45) setHelpStage((s) => (s < 1 ? 1 : s))
    if (fatigue >= 78) setHelpStage(2)
  }, [fatigue])

  const open = useCallback((id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setMinimized((prev) => prev.filter((x) => x !== id))
    setOrder((prev) => [...prev.filter((x) => x !== id), id])
  }, [])
  const close = useCallback((id: string) => {
    setOpenIds((prev) => prev.filter((x) => x !== id))
    setMinimized((prev) => prev.filter((x) => x !== id))
  }, [])
  const focus = useCallback((id: string) => {
    setMinimized((prev) => prev.filter((x) => x !== id))
    setOrder((prev) => [...prev.filter((x) => x !== id), id])
  }, [])
  const minimize = useCallback((id: string) => {
    setMinimized((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const wm = useMemo<WindowManager>(
    () => ({ open, close, focus, isOpen: (id: string) => openIds.includes(id) }),
    [open, close, focus, openIds],
  )

  return (
    <WindowManagerProvider value={wm}>
      <div className="relative h-full w-full overflow-hidden">
        {/* Wallpaper */}
        <Image src={MEDIA.wallpaper || '/placeholder.svg'} alt="Desktop wallpaper" fill priority className="object-cover [image-rendering:pixelated]" />
        <div className="absolute inset-0 bg-black/25" />

        {/* Desktop icons */}
        <div className="absolute left-3 top-3 grid grid-flow-col grid-rows-6 gap-1">
          {DESKTOP_APPS.map((a) => (
            <button
              key={a.id}
              onClick={() => open(a.id)}
              className="group flex w-24 flex-col items-center gap-1 rounded p-2 text-center transition-colors hover:bg-white/10"
            >
              <span className="relative grid size-11 place-items-center rounded-lg border border-white/15 shadow-md" style={{ background: `${a.brand}40` }}>
                <Icon name={a.icon} className="size-6 text-white drop-shadow" />
              </span>
              <span className="font-serif text-xs leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{a.label}</span>
            </button>
          ))}
          {ACCOUNTS.map((a) => (
            <button
              key={a.id}
              onClick={() => open(a.id)}
              className="group flex w-24 flex-col items-center gap-1 rounded p-2 text-center transition-colors hover:bg-white/10"
            >
              <span className="relative grid size-11 place-items-center rounded-lg border border-white/10 shadow-md" style={{ background: `${a.brand}33` }}>
                <Icon name={a.icon} className="size-6 text-white drop-shadow" />
                {solved.includes(a.id) && <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-black bg-crt" />}
              </span>
              <span className="font-serif text-xs leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{a.label}</span>
            </button>
          ))}
        </div>

        {/* Objective sticky note */}
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, y: -12, rotate: 3 }}
          animate={{ opacity: 1, y: 0, rotate: 3 }}
          whileDrag={{ scale: 1.04, rotate: 0, cursor: 'grabbing' }}
          className="paper-shadow absolute right-6 top-16 z-30 w-52 cursor-grab p-3 text-ink"
          style={{ background: 'oklch(0.9 0.11 95)' }}
        >
          <p className="font-hand text-2xl leading-tight">To do (for Dad):</p>
          <ul className="mt-1 space-y-0.5 font-hand text-xl leading-tight">
            <li className={solved.includes('netflix') ? 'text-ink/40 line-through' : ''}>- cancel Netflix</li>
            <li className={solved.includes('instagram') ? 'text-ink/40 line-through' : ''}>- his Instagram?</li>
            <li className={solved.includes('insurance') ? 'text-ink/40 line-through' : ''}>- insurance claim</li>
            <li className={solved.includes('mygov') ? 'text-ink/40 line-through' : ''}>- notify myGov</li>
            <li>- tell everyone...?</li>
          </ul>
        </motion.div>

        {/* Windows */}
        <AnimatePresence>
          {openIds.map((id) => {
            const meta = resolveWindow(id)
            if (!meta) return null
            const z = 20 + order.indexOf(id)
            return (
              <RetroWindow
                key={id}
                title={meta.title}
                icon={<Icon name={meta.icon} className="size-4" />}
                accent={meta.accent}
                z={z}
                width={meta.width}
                height={meta.height}
                minimized={minimized.includes(id)}
                initial={{ x: 130 + (order.indexOf(id) % 6) * 30, y: 50 + (order.indexOf(id) % 6) * 26 }}
                onClose={() => close(id)}
                onMinimize={() => minimize(id)}
                onFocus={() => focus(id)}
              >
                {meta.node}
              </RetroWindow>
            )
          })}
        </AnimatePresence>

        {/* Help button — always available */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute right-4 top-4 z-[70] flex items-center gap-2">
          {helpStage === 2 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, x: [6, 0, 6] }}
              transition={{ x: { duration: 1, repeat: Infinity } }}
              className="font-hand text-xl text-amber drop-shadow"
            >
              try this? &rarr;
            </motion.span>
          )}
          <motion.button
            onClick={() => goto('platform')}
            animate={helpStage === 2 ? { boxShadow: ['0 0 0px var(--amber)', '0 0 22px var(--amber)', '0 0 0px var(--amber)'] } : {}}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="flex items-center gap-2 rounded-full border border-amber/60 bg-black/70 px-4 py-2 font-type text-sm text-amber backdrop-blur transition-colors hover:bg-black/90"
          >
            <HelpCircle className="size-4" />
            Help
          </motion.button>
        </motion.div>

        <Notifications />

        {/* Taskbar */}
        <div className="absolute inset-x-0 bottom-0 z-[80] flex h-14 items-center justify-between gap-2 border-t border-white/10 bg-black/70 px-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => goto('apartment')} className="flex shrink-0 items-center gap-1.5 rounded bg-white/10 px-3 py-1.5 font-type text-xs text-white hover:bg-white/20">
              <ArrowLeft className="size-3.5" /> Apartment
            </button>
            <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
              {order.map((id) => {
                const meta = resolveWindow(id)
                if (!meta) return null
                const isMin = minimized.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => (isMin ? focus(id) : minimize(id))}
                    className={cnTaskbar(isMin)}
                    title={meta.title}
                  >
                    <Icon name={meta.icon} className="size-3.5 shrink-0" />
                    <span className="max-w-24 truncate">{meta.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1">
              <StressMeter />
            </div>
            <div className="text-right font-crt text-xs leading-tight text-white/90">
              <div>{clock.time}</div>
              <div className="text-xs text-white/60">{clock.date}</div>
            </div>
          </div>
        </div>
      </div>
    </WindowManagerProvider>
  )
}

function cnTaskbar(minimizedState: boolean) {
  return [
    'flex items-center gap-1.5 rounded px-2 py-1.5 font-serif text-xs transition-colors',
    minimizedState ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-white/20 text-white hover:bg-white/30',
  ].join(' ')
}
