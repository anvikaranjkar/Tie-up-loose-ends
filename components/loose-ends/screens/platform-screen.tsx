'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, FileCheck2, Loader2, ShieldCheck, UploadCloud } from 'lucide-react'
import Image from 'next/image'
import { ESTATE_SERVICES, MEDIA, STORY } from '@/lib/loose-ends/data'
import { Logo } from '../logo'
import { useGame } from '../store'
import { CertificateViewer } from '../ui/certificate-viewer'
import { Notifications } from '../ui/notifications'
import {
  Banknote,
  Camera,
  Clapperboard,
  CreditCard,
  Landmark,
  Mail,
  Plug,
  ShieldCheck as ShieldIcon,
} from 'lucide-react'

const SERVICE_ICONS: Record<string, React.ElementType> = {
  Clapperboard,
  Instagram: Camera,
  ShieldCheck: ShieldIcon,
  Plug,
  Landmark,
  Banknote,
  CreditCard,
  Mail,
}

export function PlatformScreen() {
  const { goto } = useGame()
  const [step, setStep] = useState(0) // 0 hero, 1 upload, 2 verify, 3 estate

  return (
    <div className="relative h-full w-full overflow-auto bg-background">
      {/* soft warm ambient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.3_0.06_80/0.4),transparent_60%)]" />
      <Notifications />

      {/* top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/80 px-5 py-3 backdrop-blur">
        <Logo size="sm" />
        <button onClick={() => goto('desktop')} className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 font-serif text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to desktop
        </button>
      </div>

      <div className="relative mx-auto max-w-2xl px-5 py-10">
        <AnimatePresence mode="wait">
          {step === 0 && <Hero key="hero" onStart={() => setStep(1)} />}
          {step === 1 && <UploadStep key="upload" onDone={() => setStep(2)} />}
          {step === 2 && <VerifyStep key="verify" onDone={() => setStep(3)} />}
          {step === 3 && <EstateStep key="estate" />}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="flex flex-col items-center gap-6 text-center">
      <span className="rounded-full border border-crt/40 bg-crt/10 px-3 py-1 font-serif text-xs text-crt">A better way</span>
      <h1 className="font-type text-3xl leading-tight text-foreground text-balance sm:text-4xl">
        Manage every tedious task after losing a loved one, in one place.
      </h1>
      <div className="space-y-1 font-serif text-base text-muted-foreground">
        <p>Upload proof of passing.</p>
        <p>Verify your identity.</p>
        <p className="text-foreground">We&apos;ll take care of the rest.</p>
      </div>
      <div className="mt-2 grid w-full gap-3 sm:grid-cols-3">
        {[
          { n: '01', t: 'Upload Death Certificate', d: 'The document you already have.' },
          { n: '02', t: 'Executor Verification', d: 'A one-time code to confirm it\u2019s you.' },
          { n: '03', t: 'Automatic Management', d: 'Every account, handled for you.' },
        ].map((s) => (
          <div key={s.n} className="rounded-lg border border-border bg-card/60 p-4 text-left">
            <p className="font-type text-xs text-amber">{s.n}</p>
            <p className="mt-1 font-type text-sm text-foreground">{s.t}</p>
            <p className="mt-1 font-serif text-xs text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
      <button onClick={onStart} className="mt-2 rounded-full bg-primary px-8 py-3 font-type text-sm text-primary-foreground transition-transform hover:scale-[1.02]">
        Get started
      </button>
    </motion.div>
  )
}

function StepShell({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-primary font-type text-sm text-primary-foreground">{n}</span>
        <h2 className="font-type text-xl text-foreground">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

function UploadStep({ onDone }: { onDone: () => void }) {
  const [state, setState] = useState<'idle' | 'uploading' | 'done'>('idle')
  const [viewer, setViewer] = useState(false)

  function upload() {
    if (state !== 'idle') return
    setState('uploading')
    window.setTimeout(() => setState('done'), 1800)
  }

  return (
    <StepShell n="1" title="Upload Death Certificate">
      <p className="font-serif text-sm text-muted-foreground">
        This is the certificate you found in {STORY.deceased.name}&apos;s apartment. Upload it once &mdash; we&apos;ll present it to every institution on your behalf.
      </p>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <button onClick={() => setViewer(true)} className="group relative mx-auto w-32 overflow-hidden rounded-md border border-border shadow-lg">
          <Image src={MEDIA.deathCertificate || '/placeholder.svg'} alt="Death certificate preview" width={128} height={180} className="h-auto w-full" />
          <span className="absolute inset-0 grid place-items-center bg-black/40 font-serif text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">Inspect</span>
        </button>

        <button
          onClick={upload}
          disabled={state !== 'idle'}
          className={`flex h-40 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors ${
            state === 'done' ? 'border-crt/50 bg-crt/10' : 'border-border bg-card/50 hover:border-primary/60 hover:bg-card'
          }`}
        >
          {state === 'idle' && (
            <>
              <UploadCloud className="size-8 text-muted-foreground" />
              <span className="font-serif text-sm text-muted-foreground">Click to upload death_certificate.jpg</span>
            </>
          )}
          {state === 'uploading' && (
            <>
              <Loader2 className="size-8 animate-spin text-primary" />
              <span className="font-serif text-sm text-muted-foreground">Uploading &amp; verifying document&hellip;</span>
            </>
          )}
          {state === 'done' && (
            <>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <FileCheck2 className="size-8 text-crt" />
              </motion.span>
              <span className="font-serif text-sm text-crt">Certificate verified</span>
            </>
          )}
        </button>
      </div>

      <button
        onClick={onDone}
        disabled={state !== 'done'}
        className="self-end rounded-full bg-primary px-6 py-2.5 font-type text-sm text-primary-foreground disabled:opacity-40"
      >
        Continue
      </button>

      <CertificateViewer open={viewer} onClose={() => setViewer(false)} />
    </StepShell>
  )
}

function VerifyStep({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [sent, setSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const codeRef = useRef('4826')

  useEffect(() => {
    if (!sent) return
    const id = window.setTimeout(() => setShowCode(true), 1400)
    return () => window.clearTimeout(id)
  }, [sent])

  useEffect(() => {
    if (otp.replace(/\s/g, '') === codeRef.current) {
      const id = window.setTimeout(() => {
        setConfirmed(true)
        window.setTimeout(onDone, 1200)
      }, 500)
      return () => window.clearTimeout(id)
    }
  }, [otp, onDone])

  return (
    <StepShell n="2" title="Executor Verification">
      <label className="flex flex-col gap-1.5">
        <span className="font-serif text-sm text-muted-foreground">Your full legal name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emma Citizen" className="rounded-md border border-input bg-card px-3 py-2.5 font-serif text-sm text-foreground outline-none focus:border-ring" />
      </label>

      {!sent ? (
        <button onClick={() => setSent(true)} disabled={name.trim().length < 3} className="self-start rounded-full bg-primary px-6 py-2.5 font-type text-sm text-primary-foreground disabled:opacity-40">
          Send one-time code to {STORY.deceased.email}
        </button>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {showCode && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 p-3">
                <Mail className="size-4 text-accent" />
                <p className="font-serif text-xs text-foreground">
                  New email &mdash; <b>Your Final Farewell code is {codeRef.current}</b>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <label className="flex flex-col gap-1.5">
            <span className="font-serif text-sm text-muted-foreground">Enter the 4-digit code</span>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              maxLength={4}
              placeholder="0000"
              className="w-40 rounded-md border border-input bg-card px-3 py-2.5 text-center font-type text-2xl tracking-[0.5em] text-foreground outline-none focus:border-ring"
            />
          </label>

          {confirmed && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-crt">
              <ShieldCheck className="size-5" />
              <span className="font-type text-sm">Identity confirmed &mdash; thank you, {name.split(' ')[0]}.</span>
            </motion.div>
          )}
        </div>
      )}
    </StepShell>
  )
}

function EstateStep() {
  const { resolve, addFatigue, fatigue } = useGame()
  const [done, setDone] = useState<number>(0)

  // resolve services one-by-one, easing fatigue toward zero as each completes
  useEffect(() => {
    if (done >= ESTATE_SERVICES.length) {
      const id = window.setTimeout(resolve, 1800)
      return () => window.clearTimeout(id)
    }
    const id = window.setTimeout(() => {
      setDone((d) => d + 1)
      addFatigue(-Math.ceil(fatigue / (ESTATE_SERVICES.length - done)) - 4)
    }, 900)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  return (
    <StepShell n="3" title="Automatic Estate Management">
      <p className="font-serif text-sm text-muted-foreground">Sit back. Each institution is being notified and handled for you.</p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {ESTATE_SERVICES.map((s, i) => {
          const complete = i < done
          const active = i === done
          const IconC = SERVICE_ICONS[s.icon] ?? Mail
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                complete ? 'border-crt/40 bg-crt/10' : active ? 'border-primary/40 bg-card' : 'border-border bg-card/40'
              }`}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary">
                <IconC className="size-4 text-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-type text-sm text-foreground">{s.label}</p>
                <p className="font-serif text-xs text-muted-foreground">{complete ? s.result : active ? 'Processing\u2026' : 'Queued'}</p>
              </div>
              {complete ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid size-6 place-items-center rounded-full bg-crt/20 text-crt">
                  <Check className="size-4" />
                </motion.span>
              ) : active ? (
                <Loader2 className="size-5 animate-spin text-primary" />
              ) : (
                <span className="size-6 rounded-full border border-border" />
              )}
            </motion.div>
          )
        })}
      </div>
    </StepShell>
  )
}
