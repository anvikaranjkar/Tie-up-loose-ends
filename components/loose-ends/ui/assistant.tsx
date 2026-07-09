'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { ASSISTANT_GREETING, type AssistantMessage } from '@/lib/loose-ends/assistant'
import { useGame } from '../store'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'What should I do first?',
  'What is an executor?',
  "I'm stuck on Instagram",
  'How do I close his Netflix?',
]

export function AssistantWindow() {
  const { clues, solved } = useGame()
  const [messages, setMessages] = useState<AssistantMessage[]>([{ role: 'assistant', content: ASSISTANT_GREETING }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function ask(question: string) {
    const q = question.trim()
    if (!q || loading) return
    const history = messages.filter((m) => m.content !== ASSISTANT_GREETING).slice(-8)
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          history,
          state: { discoveredClueIds: clues, solvedAccountIds: solved },
        }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply ?? 'I\u2019m having trouble thinking right now. Try again in a moment.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I couldn\u2019t reach my notes just now. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault()
      ask(input)
    }
  }

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-secondary px-4 py-2">
        <span className="grid size-7 place-items-center rounded-md bg-accent/20 text-accent">
          <Sparkles className="size-4" />
        </span>
        <div>
          <p className="font-type text-sm text-foreground">Estate Investigation Assistant</p>
          <p className="font-serif text-xs text-muted-foreground">Nudges &amp; definitions &middot; never spoilers</p>
        </div>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-lg px-3 py-2 font-serif text-sm leading-relaxed',
                m.role === 'user'
                  ? 'rounded-br-sm bg-accent text-accent-foreground'
                  : 'rounded-bl-sm border border-border bg-secondary text-foreground',
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              <span className="font-serif text-xs">Consulting the notebook&hellip;</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {messages.length <= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-1.5 px-4 pb-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-full border border-border bg-secondary px-2.5 py-1 font-serif text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask for a hint or a definition&hellip;"
          className="flex-1 rounded-full border border-input bg-secondary px-3 py-1.5 font-serif text-sm text-foreground outline-none focus:border-ring"
        />
        <button
          onClick={() => ask(input)}
          disabled={loading || !input.trim()}
          className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  )
}
