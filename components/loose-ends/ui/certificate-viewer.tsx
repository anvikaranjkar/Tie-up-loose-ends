'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, Minus, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { MEDIA } from '@/lib/loose-ends/data'
import { cn } from '@/lib/utils'

/**
 * Zoom / pan / fullscreen document viewer. Defaults to the death certificate
 * placeholder but accepts any src so real scanned documents can be dropped in.
 */
export function CertificateViewer({
  src = MEDIA.deathCertificate,
  alt = 'Death certificate',
  open,
  onClose,
}: {
  src?: string
  alt?: string
  open: boolean
  onClose: () => void
}) {
  const [scale, setScale] = useState(1)
  const zoomIn = () => setScale((s) => Math.min(3, +(s + 0.35).toFixed(2)))
  const zoomOut = () => setScale((s) => Math.max(1, +(s - 0.35).toFixed(2)))

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9995] flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="relative flex max-h-[88vh] max-w-[92vw] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2">
              <span className="font-type text-sm text-foreground">Registry of Births, Deaths &amp; Marriages</span>
              <div className="flex items-center gap-1">
                <button onClick={zoomOut} className="grid size-7 place-items-center rounded hover:bg-muted" aria-label="Zoom out">
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center font-type text-xs text-muted-foreground">{Math.round(scale * 100)}%</span>
                <button onClick={zoomIn} className="grid size-7 place-items-center rounded hover:bg-muted" aria-label="Zoom in">
                  <Plus className="size-4" />
                </button>
                <button onClick={onClose} className="ml-2 grid size-7 place-items-center rounded bg-destructive/80 text-paper hover:bg-destructive" aria-label="Close">
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className={cn('relative flex-1 overflow-auto bg-muted/40 p-4', scale > 1 ? 'cursor-grab' : '')}>
              <div className="mx-auto w-fit" style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
                <Image
                  src={src || '/placeholder.svg'}
                  alt={alt}
                  width={500}
                  height={700}
                  className="h-auto w-[min(500px,80vw)] rounded shadow-lg"
                  draggable={false}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-border bg-secondary px-4 py-1.5 text-muted-foreground">
              <Maximize2 className="size-3" />
              <span className="font-serif text-xs">Scroll to read &middot; use +/- to zoom &middot; click outside to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
