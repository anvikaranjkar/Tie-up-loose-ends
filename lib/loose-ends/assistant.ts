// ---------------------------------------------------------------------------
// Estate Investigation Assistant — shared, provider-agnostic logic.
//
// This module holds everything that is NOT tied to a specific AI vendor:
//   - the game-state contract sent from the client
//   - the system prompt / persona
//   - a deterministic, spoiler-aware local fallback so the assistant is useful
//     even when no AI provider is configured.
//
// The actual model call lives behind `lib/loose-ends/ai-provider.ts`, so the
// provider (Anthropic today) can be swapped without touching this file.
// ---------------------------------------------------------------------------

import { ACCOUNTS, CLUES } from './data'

/** Minimal, spoiler-safe snapshot of progress sent to the server. */
export type AssistantState = {
  discoveredClueIds: string[]
  solvedAccountIds: string[]
}

export type AssistantMessage = { role: 'user' | 'assistant'; content: string }

export const ASSISTANT_GREETING =
  "I'm your Estate Investigation Assistant. I can explain unfamiliar estate terms, or give you a gentle nudge when you're stuck — but I'll only ever point toward what you've already found. What's slowing you down?"

// ---------------------------------------------------------------------------
// Build a compact, spoiler-aware context block + system persona.
// ---------------------------------------------------------------------------
export function buildSystemPrompt(state: AssistantState): string {
  const found = state.discoveredClueIds
    .map((id) => CLUES[id])
    .filter(Boolean)
    .map((c) => `- ${c.title}: "${c.value}" (found via ${c.found})`)

  const solved = state.solvedAccountIds
    .map((id) => ACCOUNTS.find((a) => a.id === id)?.label)
    .filter(Boolean)

  const remaining = ACCOUNTS.filter(
    (a) => (a.kind === 'login' || a.kind === 'security') && !state.solvedAccountIds.includes(a.id),
  ).map((a) => `- ${a.label}`)

  return `You are the Estate Investigation Assistant inside "Final Farewell", a narrative game where Emma is closing her late father John's digital accounts. You are a calm, respectful investigator's notebook — NOT a chatty general chatbot.

STRICT RULES:
- Never reveal a password, security answer, or any clue value the player has NOT already discovered. If asked, gently say they need to keep searching the apartment.
- You MAY reference clues the player HAS already found (listed below) and connect them to accounts.
- Give nudges and questions, not outright solutions. Prefer "Have you checked...?" over "The answer is...".
- Keep replies to 1-3 short sentences. Warm, plain, unhurried. Grief-aware, never flippant.
- You may explain real estate-admin terms (probate, executor, memorialisation, beneficiary) plainly.

CLUES THE PLAYER HAS ALREADY DISCOVERED:
${found.length ? found.join('\n') : '- (none yet — they should search the apartment)'}

ACCOUNTS ALREADY ACCESSED:
${solved.length ? solved.map((s) => `- ${s}`).join('\n') : '- (none yet)'}

ACCOUNTS STILL LOCKED:
${remaining.length ? remaining.join('\n') : '- (all accessed)'}`
}

// ---------------------------------------------------------------------------
// Deterministic fallback used when no AI provider is configured. It follows
// the same spoiler rules: only nudges toward already-discovered clues.
// ---------------------------------------------------------------------------
export function localAssistantReply(state: AssistantState, question: string): string {
  const q = question.toLowerCase()
  const has = (id: string) => state.discoveredClueIds.includes(id)

  // Term explanations (safe, no spoilers).
  if (q.includes('executor')) return 'An executor is the person legally responsible for settling an estate — that’s Emma. It lets you act on John’s behalf with banks and agencies.'
  if (q.includes('probate')) return 'Probate is the court’s confirmation that the will is valid and the executor can act. Many services ask for it before releasing anything.'
  if (q.includes('memorial')) return 'Memorialisation turns a social account into a remembrance page — it stays visible but is locked from new logins.'
  if (q.includes('beneficiary')) return 'A beneficiary is whoever is named to receive a policy’s payout. On John’s policy that line was left blank, which complicates the claim.'

  // Account-specific nudges, gated on discovered clues.
  if (q.includes('instagram') || q.includes('insta'))
    return has('football')
      ? 'For Instagram, think about what John was devoted to every winter. You already found it framed on his wall.'
      : 'Instagram’s password is something he loved dearly. Have you looked closely at what’s framed on his walls?'
  if (q.includes('netflix'))
    return has('pet')
      ? 'Netflix uses a name full of affection — check that old photo album you found again.'
      : 'Try the apartment first — there’s a photo album with a name John never forgot.'
  if (q.includes('email') || q.includes('gmail') || q.includes('wifi') || q.includes('wi-fi'))
    return has('wifi')
      ? 'He reused one password for everything — the one you found behind the modem.'
      : 'Check behind the modem/router. People often stick their most-reused password there.'
  if (q.includes('mygov') || q.includes('gov'))
    return has('birthday')
      ? 'myGov asks for the year he was born — you saw it on that birthday card.'
      : 'myGov asks a security question about his birth year. The calendar and a card might help.'
  if (q.includes('insurance') || q.includes('meridian') || q.includes('policy'))
    return has('policy')
      ? 'The insurer wants the policy number — you already pulled it from the desk drawer.'
      : 'Meridian Life needs the policy number. Have you searched the desk drawer?'

  // Generic guidance.
  const remaining = ACCOUNTS.filter(
    (a) => (a.kind === 'login' || a.kind === 'security') && !state.solvedAccountIds.includes(a.id),
  )
  if (state.discoveredClueIds.length === 0)
    return 'Start in the apartment — click around John’s things. Every clue you find unlocks one of his accounts.'
  if (remaining.length === 0) return 'You’ve accessed everything. When you’re ready, the Final Farewell platform can close it all out at once.'
  return `You’ve found ${state.discoveredClueIds.length} clue${state.discoveredClueIds.length === 1 ? '' : 's'}. Open your Investigation Evidence beside a login and match a clue to the account you’re stuck on — ${remaining[0].label} is still locked.`
}
