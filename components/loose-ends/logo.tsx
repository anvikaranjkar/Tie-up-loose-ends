'use client'

import Image from 'next/image'
import { MEDIA, STORY } from '@/lib/loose-ends/data'
import { cn } from '@/lib/utils'

/**
 * Final Farewell branding mark.
 *
 * The logo is a REUSABLE PLACEHOLDER. To rebrand the entire app, drop a new
 * file at /public/final-farewell/logo.svg (see MEDIA.logo in data.ts) — every
 * screen renders through this single component, so nothing else needs to change.
 */
export function Logo({
  className,
  showTagline = false,
  size = 'md',
}: {
  className?: string
  showTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const dims = {
    sm: { w: 128, h: 30 },
    md: { w: 200, h: 47 },
    lg: { w: 360, h: 85 },
  }[size]

  return (
    <div className={cn('flex flex-col items-center gap-3 select-none', className)}>
      <Image
        src={MEDIA.logo || '/placeholder.svg'}
        alt={STORY.title}
        width={dims.w}
        height={dims.h}
        priority
        className="h-auto"
      />
      {showTagline && (
        <p className="font-hand text-amber-soft text-lg sm:text-xl text-balance text-center max-w-md">
          {STORY.tagline}
        </p>
      )}
    </div>
  )
}
