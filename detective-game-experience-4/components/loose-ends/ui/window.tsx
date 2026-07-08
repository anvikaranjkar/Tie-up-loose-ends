'use client'

import { useRef, useState } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { Minus, Square, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Draggable + resizable retro window chrome shared across the desktop.
 * - Dragging is bound to the title bar via dragControls.
 * - A bottom-right grip resizes the window (pointer events, clamped).
 * - Minimize / focus are delegated to the desktop via callbacks.
 */
export function RetroWindow({
  title,
  icon,
  children,
  onClose,
  onMinimize,
  onFocus,
  z = 10,
  initial,
  width = 460,
  height = 340,
  minWidth = 300,
  minHeight = 240,
  accent = 'var(--dust-blue)',
  resizable = true,
  minimized = false,
  className,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  onClose?: () => void
  onMinimize?: () => void
  onFocus?: () => void
  z?: number
  initial?: { x: number; y: number }
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  accent?: string
  resizable?: boolean
  minimized?: boolean
  className?: string
}) {
  const controls = useDragControls()
  const [size, setSize] = useState({ w: width, h: height })
  const resizing = useRef<{ startX: number; startY: number; w: number; h: number } | null>(null)

  function onResizePointerDown(e: React.PointerEvent) {
    e.stopPropagation()
    e.preventDefault()
    onFocus?.()
    resizing.current = { startX: e.clientX, startY: e.clientY, w: size.w, h: size.h }
    const move = (ev: PointerEvent) => {
      if (!resizing.current) return
      const dw = ev.clientX - resizing.current.startX
      const dh = ev.clientY - resizing.current.startY
      setSize({
        w: Math.max(minWidth, Math.min(window.innerWidth * 0.94, resizing.current.w + dw)),
        h: Math.max(minHeight, Math.min(window.innerHeight * 0.86, resizing.current.h + dh)),
      })
    }
    const up = () => {
      resizing.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      onPointerDown={onFocus}
      initial={{ opacity: 0, scale: 0.94, x: initial?.x ?? 60, y: initial?.y ?? 60 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      style={{ zIndex: z, width: size.w, height: size.h, display: minimized ? 'none' : undefined }}
      className={cn(
        'win-bezel absolute flex max-h-[86%] max-w-[94vw] flex-col overflow-hidden rounded-md border border-border bg-card',
        className,
      )}
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        onDoubleClick={onFocus}
        className="win-titlebar flex cursor-grab touch-none items-center justify-between px-2 py-1.5 active:cursor-grabbing"
        style={{ background: `linear-gradient(180deg, ${accent}, color-mix(in oklch, ${accent}, black 30%))` }}
      >
        <div className="flex items-center gap-2 px-1 text-paper">
          {icon}
          <span className="font-type text-sm tracking-wide drop-shadow">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="grid size-5 place-items-center rounded-sm bg-white/15 text-paper hover:bg-white/30"
            aria-label="Minimize"
          >
            <Minus className="size-3" />
          </button>
          <button className="grid size-5 place-items-center rounded-sm bg-white/15 text-paper hover:bg-white/30" aria-label="Maximize">
            <Square className="size-2.5" />
          </button>
          <button
            onClick={onClose}
            className="grid size-5 place-items-center rounded-sm bg-destructive/80 text-paper hover:bg-destructive"
            aria-label="Close"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-card">{children}</div>

      {resizable && (
        <div
          onPointerDown={onResizePointerDown}
          className="absolute bottom-0 right-0 z-10 flex size-4 cursor-nwse-resize items-end justify-end p-0.5"
          aria-label="Resize"
        >
          <span className="pointer-events-none block size-2.5 border-b-2 border-r-2 border-muted-foreground/60" />
        </div>
      )}
    </motion.div>
  )
}
