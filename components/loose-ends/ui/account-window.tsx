'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, FolderOpen, Lightbulb, Loader2, Lock, Plus } from 'lucide-react'
import Image from 'next/image'
import { INSTAGRAM, MEDIA, SUPPORT_SCRIPT, type Account } from '@/lib/loose-ends/data'
import { useGame } from '../store'
import { useWindows } from './window-manager'
import { NetflixView } from './netflix'
import { cn } from '@/lib/utils'

function norm(s: string) {
  return s.trim().toLowerCase()
}

export function AccountWindow({ account }: { account: Account }) {
  const { solve, fail, solved } = useGame()
  const alreadySolved = solved.includes(account.id)

  if (account.kind === 'chat') return <SupportChat />
  if (account.kind === 'file') return <FileView account={account} />
  if (alreadySolved) return <SuccessView account={account} />
  return <LoginView account={account} onSuccess={() => solve(account.id)} onFail={fail} />
}

// ---------------------------------------------------------------------------
// Login / security-question flow
// ---------------------------------------------------------------------------
function LoginView({ account, onSuccess, onFail }: { account: Account; onSuccess: () => void; onFail: () => void }) {
  const isSecurity = account.kind === 'security'
  const expected = isSecurity ? account.securityAnswer! : account.password!
  const { open } = useWindows()
  const [username, setUsername] = useState(account.username ?? '')
  const [value, setValue] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [remember, setRemember] = useState(false)
  const [ok, setOk] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading || ok) return
    setLoading(true)
    setError('')
    window.setTimeout(() => {
      if (norm(value) === norm(expected)) {
        setOk(true)
        setLoading(false)
        window.setTimeout(onSuccess, 900)
      } else {
        const n = attempts + 1
        setAttempts(n)
        onFail()
        setLoading(false)
        setShake(true)
        window.setTimeout(() => setShake(false), 500)
        setError(
          isSecurity
            ? 'That answer doesn\u2019t match our records. Please try again.'
            : `Incorrect password. ${Math.max(0, 3 - n)} attempt${3 - n === 1 ? '' : 's'} remaining.`,
        )
        if (n >= 2) setShowHint(true)
      }
    }, 850)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-card px-6 py-8">
      <div className="grid size-12 place-items-center rounded-xl" style={{ background: account.brand }}>
        <Lock className="size-6 text-white" />
      </div>
      <div className="text-center">
        <h3 className="font-type text-lg text-foreground">{account.label}</h3>
        <p className="font-serif text-xs text-muted-foreground">Sign in to continue</p>
      </div>

      {ok ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 rounded-full bg-crt/20 px-4 py-2 text-crt">
          <Check className="size-4" /> <span className="font-type text-sm">Access granted</span>
        </motion.div>
      ) : (
        <motion.form
          onSubmit={submit}
          animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.45 }}
          className="w-full max-w-xs space-y-2.5"
        >
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            readOnly={account.usernameFixed}
            className={cn(
              'w-full rounded-md border border-input bg-secondary px-3 py-2 font-serif text-sm text-foreground outline-none focus:border-ring',
              account.usernameFixed && 'text-muted-foreground',
            )}
            placeholder="Username"
          />
          {isSecurity && <p className="px-1 font-serif text-xs text-muted-foreground">{account.securityQuestion}</p>}
          <input
            type={isSecurity ? 'text' : 'password'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className="w-full rounded-md border border-input bg-secondary px-3 py-2 font-serif text-sm text-foreground outline-none focus:border-ring"
            placeholder={isSecurity ? 'Your answer' : 'Password'}
          />

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1.5 px-1 font-serif text-xs text-destructive">
                <AlertCircle className="size-3.5 shrink-0" /> {error}
              </motion.p>
            )}
          </AnimatePresence>

          <label className="flex cursor-pointer items-center gap-2 px-1 font-serif text-xs text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-3.5 accent-[var(--accent)]"
            />
            Remember this device
          </label>

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-md py-2 font-type text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ background: account.brand }}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? 'Verifying\u2026' : 'Sign In'}
          </button>

          <div className="flex items-center justify-between px-1">
            <button type="button" onClick={() => setShowHint((s) => !s)} className="font-serif text-xs text-accent hover:underline">
              Forgot password?
            </button>
            <button type="button" onClick={() => open('evidence')} className="flex items-center gap-1 font-serif text-xs text-muted-foreground hover:text-foreground">
              <FolderOpen className="size-3" /> Open evidence
            </button>
          </div>

          <AnimatePresence>
            {showHint && account.passwordHint && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 rounded-md border border-amber/30 bg-amber/10 p-2.5">
                <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber" />
                <p className="font-serif text-xs text-amber-soft">
                  <b>Password hint:</b> {account.passwordHint}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Post-login success views (account-specific)
// ---------------------------------------------------------------------------
function SuccessView({ account }: { account: Account }) {
  if (account.id === 'instagram') return <InstagramView />
  if (account.id === 'netflix') return <NetflixView />
  return (
    <div className="flex h-full flex-col gap-3 bg-card p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-md text-white" style={{ background: account.brand }}>
          <Check className="size-4" />
        </span>
        <h3 className="font-type text-base text-foreground">{account.successTitle}</h3>
      </div>
      <p className="font-serif text-sm leading-relaxed text-muted-foreground">{account.successBody}</p>
      <div className="mt-auto rounded-md border border-border bg-secondary/60 p-3 font-serif text-xs text-muted-foreground">
        You&apos;re in &mdash; but this is only one of many. Every service will ask you to prove all of this again.
      </div>
    </div>
  )
}

function InstagramView() {
  return (
    <div className="flex h-full flex-col bg-black text-white">
      <div className="flex items-center gap-4 border-b border-white/10 p-4">
        <div className="rounded-full bg-gradient-to-tr from-amber via-rust to-accent p-[2px]">
          <Image src={MEDIA.instagram || '/placeholder.svg'} alt="John Citizen" width={72} height={72} className="size-16 rounded-full border-2 border-black object-cover" />
        </div>
        <div className="flex-1">
          <p className="font-sans text-base font-semibold">{INSTAGRAM.handle}</p>
          <div className="mt-1 flex gap-4 font-sans text-xs text-white/80">
            <span><b className="text-white">{INSTAGRAM.posts}</b> posts</span>
            <span><b className="text-white">{INSTAGRAM.followers}</b> followers</span>
            <span><b className="text-white">{INSTAGRAM.following}</b> following</span>
          </div>
        </div>
      </div>
      <div className="border-b border-white/10 px-4 py-2 font-sans text-xs text-white/70">
        {INSTAGRAM.bio.map((b) => <p key={b}>{b}</p>)}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="mb-3 rounded-md border border-white/10 bg-white/5 p-3">
          <p className="font-sans text-xs text-white/50">Last post &middot; {INSTAGRAM.lastPost.date}</p>
          <p className="mt-1 font-sans text-sm">{INSTAGRAM.lastPost.caption}</p>
          <p className="mt-1 font-sans text-xs text-white/50">{INSTAGRAM.lastPost.likes} likes</p>
        </div>
        <p className="mb-2 font-sans text-xs uppercase tracking-wider text-white/40">Comments</p>
        <div className="space-y-2.5">
          {INSTAGRAM.comments.map((c, i) => (
            <div key={i} className="font-sans text-sm">
              <span className="font-semibold">{c.user}</span> <span className="text-white/85">{c.text}</span>
              <p className="text-xs text-white/40">{c.days === 0 ? 'shortly before' : `${c.days}w`} &middot; after his last post</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-md border border-amber/30 bg-amber/10 p-3 font-serif text-xs text-amber-soft">
          How do you even tell everyone? There should be one place that quietly handles this.
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// File viewer (txt / locked pdf)
// ---------------------------------------------------------------------------
function FileView({ account }: { account: Account }) {
  const { fail } = useGame()
  const [unlocked, setUnlocked] = useState(!account.file?.locked)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (norm(pw) === 'ml-4471') setUnlocked(true)
    else {
      setErr(true)
      fail()
      window.setTimeout(() => setErr(false), 500)
    }
  }

  if (!unlocked) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-card p-6">
        <Lock className="size-8 text-muted-foreground" />
        <p className="font-type text-sm text-foreground">{account.file?.name}</p>
        <p className="font-serif text-xs text-muted-foreground">This document is password protected.</p>
        <motion.form onSubmit={tryUnlock} animate={err ? { x: [0, -6, 6, 0] } : {}} className="flex w-full max-w-xs gap-2">
          <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Document password" className="flex-1 rounded-md border border-input bg-secondary px-3 py-2 font-serif text-sm outline-none focus:border-ring" />
          <button className="rounded-md bg-primary px-3 py-2 font-type text-sm text-primary-foreground">Open</button>
        </motion.form>
        <p className="font-serif text-xs text-muted-foreground">Hint: the policy number (check the desk drawer).</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#1c1c1c] p-4">
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[#d6d6d6]">{account.file?.lines.join('\n')}</pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Support chat — circular, fatiguing
// ---------------------------------------------------------------------------
function SupportChat() {
  const { fail } = useGame()
  const [shown, setShown] = useState(0)
  const [typing, setTyping] = useState(true)
  const scroller = useRef<HTMLDivElement>(null)

  // Drives the scripted "agent is typing…" indicator between messages. The
  // synchronous toggles here are intentional async sequencing, not derived
  // state, so the indicator shows while the next line is pending.
  useEffect(() => {
    if (shown >= SUPPORT_SCRIPT.length) {
      setTyping(false)
      return
    }
    setTyping(true)
    const id = window.setTimeout(() => {
      setShown((s) => s + 1)
      setTyping(false)
      if (SUPPORT_SCRIPT[shown]?.from === 'rep') fail()
    }, 1100 + Math.random() * 800)
    return () => window.clearTimeout(id)
  }, [shown, fail])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [shown, typing])

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b border-border bg-secondary px-4 py-2 font-type text-sm text-foreground">National Bank &mdash; Live Support</div>
      <div ref={scroller} className="min-h-0 flex-1 space-y-2 overflow-auto p-4">
        {SUPPORT_SCRIPT.slice(0, shown).map((m, i) => (
          <div key={i} className={cn('flex', m.from === 'you' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[80%] rounded-2xl px-3 py-2 font-serif text-sm', m.from === 'you' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-foreground')}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && shown < SUPPORT_SCRIPT.length && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl bg-secondary px-3 py-2.5">
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-border p-3">
        <input disabled placeholder={"You're number 24 in the queue\u2026"} className="flex-1 rounded-full border border-input bg-secondary px-3 py-1.5 font-serif text-xs text-muted-foreground" />
        <Plus className="size-4 text-muted-foreground" />
      </div>
    </div>
  )
}
