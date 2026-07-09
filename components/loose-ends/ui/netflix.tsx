'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Plus, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { NETFLIX_PROFILES, NETFLIX_ROWS, type NetflixTitle } from '@/lib/loose-ends/data'

/**
 * Realistic Netflix experience: profile gate -> browse page with rows.
 * All artwork is optional; a styled gradient tile is shown when a title has
 * no `art` file, so real images can be dropped in later without code changes.
 */
export function NetflixView() {
  const [stage, setStage] = useState<'loading' | 'profiles' | 'browse'>('loading')
  const [profile, setProfile] = useState<(typeof NETFLIX_PROFILES)[number] | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setStage('profiles'), 1100)
    return () => window.clearTimeout(t)
  }, [])

  if (stage === 'loading') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-black">
        <motion.span
          className="font-type text-3xl font-bold tracking-tight text-[#e50914]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          NETFLIX
        </motion.span>
        <div className="h-0.5 w-40 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full bg-[#e50914]" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1 }} />
        </div>
      </div>
    )
  }

  if (stage === 'profiles') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-8 bg-[#141414] p-6">
        <h2 className="font-type text-2xl text-white">Who&apos;s watching?</h2>
        <div className="flex flex-wrap items-start justify-center gap-5">
          {NETFLIX_PROFILES.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setProfile(p)
                setStage('browse')
              }}
              className="group flex flex-col items-center gap-2"
            >
              <span
                className="grid size-20 place-items-center rounded-md ring-2 ring-transparent transition-all group-hover:scale-105 group-hover:ring-white"
                style={{ background: p.color }}
              >
                <span className="font-type text-3xl text-black/70">{p.name[0]}</span>
              </span>
              <span className="font-serif text-sm text-white/60 group-hover:text-white">{p.name}</span>
            </button>
          ))}
        </div>
        <p className="max-w-xs rounded-md bg-white/5 px-3 py-2 text-center font-serif text-xs text-white/60">
          Still billing <b className="text-white">$22.99</b>/month to a closed estate account.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto bg-[#141414]">
      {/* hero */}
      <div className="relative flex h-56 flex-col justify-end overflow-hidden p-5">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, #1e5f74, #141414 70%)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        <div className="relative">
          <p className="font-type text-2xl font-bold text-white drop-shadow">The Fisherman&apos;s Coast</p>
          <p className="mt-1 max-w-sm font-serif text-xs text-white/70">
            A quiet series about a man, a tinnie, and the same fishing spot every Sunday. John&apos;s most-watched.
          </p>
          <div className="mt-3 flex gap-2">
            <button className="flex items-center gap-1.5 rounded bg-white px-4 py-1.5 font-type text-sm text-black transition-transform hover:scale-105">
              <Play className="size-4 fill-black" /> Resume
            </button>
            <button className="flex items-center gap-1.5 rounded bg-white/20 px-4 py-1.5 font-type text-sm text-white transition-colors hover:bg-white/30">
              <Plus className="size-4" /> My List
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-5 pb-1 pt-2">
        {profile && <span className="grid size-5 place-items-center rounded-sm" style={{ background: profile.color }} />}
        <span className="font-serif text-xs text-white/50">Signed in as {profile?.name}</span>
      </div>

      {NETFLIX_ROWS.map((row) => (
        <NetflixRow key={row.heading} heading={row.heading} titles={row.titles} />
      ))}

      <div className="m-5 rounded-md border border-amber/30 bg-amber/10 p-3 font-serif text-xs text-amber-soft">
        Cancelling this subscription requires a certified death certificate uploaded to their web form. There is no phone option.
      </div>
    </div>
  )
}

function NetflixRow({ heading, titles }: { heading: string; titles: NetflixTitle[] }) {
  return (
    <div className="px-5 py-2">
      <h3 className="mb-2 font-type text-sm text-white">{heading}</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {titles.map((t) => (
          <NetflixTile key={t.id} title={t} />
        ))}
      </div>
    </div>
  )
}

function NetflixTile({ title }: { title: NetflixTitle }) {
  const [broken, setBroken] = useState(false)
  const showArt = title.art && !broken

  return (
    <motion.div
      whileHover={{ scale: 1.06, zIndex: 2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative aspect-video w-40 shrink-0 overflow-hidden rounded-md shadow-md"
    >
      {showArt ? (
        <Image src={title.art as string} alt={title.title} fill className="object-cover" onError={() => setBroken(true)} />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center" style={{ background: `linear-gradient(135deg, ${title.accent}, #0c0c0c)` }}>
          <span className="font-type text-xs leading-tight text-white/90">{title.title}</span>
        </div>
      )}

      {/* hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex items-center gap-1">
          <span className="grid size-6 place-items-center rounded-full bg-white text-black">
            <Play className="size-3 fill-black" />
          </span>
          <span className="grid size-6 place-items-center rounded-full border border-white/60 text-white">
            <Plus className="size-3" />
          </span>
          <span className="ml-auto grid size-6 place-items-center rounded-full border border-white/60 text-white">
            <ChevronDown className="size-3" />
          </span>
        </div>
        <p className="mt-1 font-serif text-xs text-white/70">{title.tag}</p>
      </div>

      {typeof title.progress === 'number' && (
        <div className="absolute inset-x-1 bottom-1 h-1 overflow-hidden rounded-full bg-white/25">
          <div className="h-full bg-[#e50914]" style={{ width: `${title.progress}%` }} />
        </div>
      )}
    </motion.div>
  )
}
