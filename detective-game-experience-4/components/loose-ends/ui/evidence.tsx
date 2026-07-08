'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileImage,
  FileText,
  Mail,
  Minus,
  Pin,
  Plus,
  RotateCcw,
  Highlighter,
  Star,
  StickyNote,
  Wallet,
  ScrollText,
} from 'lucide-react'
import Image from 'next/image'
import { CLUES, MEDIA, type Clue, type ClueDocType } from '@/lib/loose-ends/data'
import { useGame } from '../store'
import { useWindows } from './window-manager'
import { cn } from '@/lib/utils'

const DOC_ICON: Record<ClueDocType, React.ElementType> = {
  note: StickyNote,
  card: Mail,
  photo: FileImage,
  letter: ScrollText,
  bill: FileText,
  certificate: FileImage,
  wallet: Wallet,
}

// ---------------------------------------------------------------------------
// Evidence folder — every clue collected in the apartment, as XP-style files.
// ---------------------------------------------------------------------------
export function EvidenceFolder() {
  const { clues, pinned, important } = useGame()
  const { open } = useWindows()

  const collected = clues
    .map((id) => CLUES[id])
    .filter(Boolean)
    .sort((a, b) => {
      const pa = pinned.includes(a.id) ? 0 : 1
      const pb = pinned.includes(b.id) ? 0 : 1
      return pa - pb
    })

  return (
    <div className="flex h-full flex-col bg-[#f3f1ea]">
      <div className="flex items-center justify-between border-b border-black/10 bg-[#e9e6dc] px-3 py-1.5">
        <span className="font-serif text-xs text-ink/70">
          {collected.length} item{collected.length === 1 ? '' : 's'} &middot; John&apos;s estate
        </span>
        <span className="font-serif text-xs text-ink/50">Details view</span>
      </div>

      {collected.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <FileText className="size-8 text-ink/30" />
          <p className="font-serif text-sm text-ink/60">No evidence collected yet.</p>
          <p className="font-serif text-xs text-ink/40">Search John&apos;s apartment to gather clues.</p>
        </div>
      ) : (
        <div className="grid flex-1 auto-rows-min grid-cols-2 gap-1 overflow-auto p-3 sm:grid-cols-3">
          {collected.map((clue) => {
            const DocIcon = DOC_ICON[clue.docType] ?? FileText
            return (
              <button
                key={clue.id}
                onDoubleClick={() => open(`clue:${clue.id}`)}
                onClick={() => open(`clue:${clue.id}`)}
                className="group relative flex flex-col items-center gap-1.5 rounded p-3 text-center transition-colors hover:bg-[#cfe0f5] focus:bg-[#cfe0f5] focus:outline-none"
              >
                {pinned.includes(clue.id) && <Pin className="absolute left-1 top-1 size-3 text-accent" />}
                {important.includes(clue.id) && <Star className="absolute right-1 top-1 size-3 fill-amber text-amber" />}
                <span className="grid size-12 place-items-center rounded-md border border-black/10 bg-white shadow-sm">
                  <DocIcon className="size-6 text-[#3a5a8c]" />
                </span>
                <span className="line-clamp-2 break-all font-serif text-xs leading-tight text-ink/80">{clue.fileName}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="border-t border-black/10 bg-[#e9e6dc] px-3 py-1.5">
        <p className="font-serif text-xs text-ink/50">Double-click an item to inspect it. Pin or flag anything useful.</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Evidence preview — read, zoom, flip, highlight, pin, mark important.
// ---------------------------------------------------------------------------
export function EvidencePreview({ clueId }: { clueId: string }) {
  const { pinned, important, togglePin, toggleImportant } = useGame()
  const [scale, setScale] = useState(1)
  const [flipped, setFlipped] = useState(false)
  const [highlight, setHighlight] = useState(true)

  const clue = CLUES[clueId]
  if (!clue) return <div className="p-6 font-serif text-sm text-muted-foreground">This item is no longer available.</div>

  const isPinned = pinned.includes(clue.id)
  const isImportant = important.includes(clue.id)
  const canFlip = Boolean(clue.flip)

  return (
    <div className="flex h-full flex-col bg-card">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary px-2 py-1.5">
        <ToolButton label="Zoom out" onClick={() => setScale((s) => Math.max(0.7, +(s - 0.2).toFixed(2)))}>
          <Minus className="size-3.5" />
        </ToolButton>
        <span className="w-10 text-center font-type text-xs text-muted-foreground">{Math.round(scale * 100)}%</span>
        <ToolButton label="Zoom in" onClick={() => setScale((s) => Math.min(2.4, +(s + 0.2).toFixed(2)))}>
          <Plus className="size-3.5" />
        </ToolButton>
        <div className="mx-1 h-4 w-px bg-border" />
        {canFlip && (
          <ToolButton label="Flip" active={flipped} onClick={() => setFlipped((f) => !f)}>
            <RotateCcw className="size-3.5" /> <span className="ml-1 font-type text-xs">Flip</span>
          </ToolButton>
        )}
        <ToolButton label="Highlight" active={highlight} onClick={() => setHighlight((h) => !h)}>
          <Highlighter className="size-3.5" />
        </ToolButton>
        <div className="ml-auto flex items-center gap-1">
          <ToolButton label="Pin" active={isPinned} onClick={() => togglePin(clue.id)}>
            <Pin className={cn('size-3.5', isPinned && 'fill-accent')} />
          </ToolButton>
          <ToolButton label="Mark important" active={isImportant} onClick={() => toggleImportant(clue.id)}>
            <Star className={cn('size-3.5', isImportant && 'fill-amber text-amber')} />
          </ToolButton>
        </div>
      </div>

      {/* document */}
      <div className="min-h-0 flex-1 overflow-auto bg-muted/40 p-4">
        <motion.div
          className="mx-auto w-fit"
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          style={{ transformOrigin: 'top center' }}
        >
          <DocumentBody clue={clue} flipped={flipped} highlight={highlight} />
        </motion.div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-border bg-secondary px-3 py-1.5">
        <span className="font-serif text-xs text-muted-foreground">Found: {clue.found}</span>
        {isImportant && <span className="font-serif text-xs text-amber">Flagged important</span>}
      </div>
    </div>
  )
}

function ToolButton({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex items-center rounded px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        active && 'bg-accent/15 text-accent',
      )}
    >
      {children}
    </button>
  )
}

/** Renders a highlighted fragment: the key value glows when highlight is on. */
function Highlighted({ text, term, on }: { text: string; term?: string; on: boolean }) {
  if (!on || !term || !text.includes(term)) return <>{text}</>
  const parts = text.split(term)
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <mark className="rounded bg-amber/60 px-0.5 text-ink">{term}</mark>}
        </span>
      ))}
    </>
  )
}

function DocumentBody({ clue, flipped, highlight }: { clue: Clue; flipped: boolean; highlight: boolean }) {
  // Photographs & cards: styled polaroid / card that can be flipped.
  if (clue.docType === 'photo' || clue.docType === 'card') {
    return (
      <div className="relative" style={{ perspective: 1000 }}>
        <motion.div
          className="relative h-[300px] w-[240px]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* front */}
          <div className="absolute inset-0 flex flex-col rounded-sm bg-paper p-3 shadow-xl" style={{ backfaceVisibility: 'hidden' }}>
            <div
              className="flex flex-1 items-center justify-center rounded-sm"
              style={{ background: `linear-gradient(135deg, ${clue.docType === 'card' ? '#c96f8a' : '#6d8a9c'}, #2b2b33)` }}
            >
              <FileImage className="size-10 text-white/70" />
            </div>
            <p className="mt-2 text-center font-hand text-lg text-ink">{clue.title}</p>
          </div>
          {/* back */}
          <div
            className="absolute inset-0 flex flex-col justify-center rounded-sm bg-[#efe9dc] p-4 shadow-xl"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="whitespace-pre-line font-hand text-lg leading-snug text-ink">
              <Highlighted text={clue.flip ?? clue.note} term={clue.highlight} on={highlight} />
            </p>
          </div>
        </motion.div>
        {!flipped && clue.flip && (
          <p className="mt-2 text-center font-serif text-xs text-muted-foreground">Something is written on the back.</p>
        )}
      </div>
    )
  }

  // Certificate: the scanned document image.
  if (clue.docType === 'certificate') {
    return (
      <div className="w-[min(440px,78vw)] rounded bg-white p-2 shadow-xl">
        <Image
          src={MEDIA.deathCertificate || '/placeholder.svg'}
          alt="Death certificate"
          width={500}
          height={700}
          className="h-auto w-full rounded"
        />
        <p className="mt-2 text-center font-serif text-xs text-ink/60">
          <Highlighted text={`Registration ${clue.value.replace('Registration ', '')}`} term={clue.highlight} on={highlight} />
        </p>
      </div>
    )
  }

  // Notes / wallet slips / letters: paper documents with monospace body.
  const isNote = clue.docType === 'note' || clue.docType === 'wallet'
  return (
    <div
      className={cn(
        'w-[300px] rounded-sm p-5 shadow-xl',
        isNote ? 'bg-[#fdf3b6] font-hand text-ink' : 'bg-paper font-serif text-ink',
      )}
    >
      {!isNote && <p className="mb-3 border-b border-ink/20 pb-2 font-type text-sm tracking-wide text-ink/80">{clue.title}</p>}
      <p className={cn('whitespace-pre-line leading-relaxed', isNote ? 'text-xl' : 'text-sm')}>
        <Highlighted text={clue.note} term={clue.highlight} on={highlight} />
      </p>
      <div className="mt-4 border-t border-ink/15 pt-2">
        <p className="font-serif text-xs text-ink/60">
          Key detail:{' '}
          <b className={highlight ? 'rounded bg-amber/60 px-1 text-ink' : ''}>{clue.value}</b>
        </p>
      </div>
    </div>
  )
}
