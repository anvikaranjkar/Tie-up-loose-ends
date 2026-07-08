import { generateText } from 'ai'
import { z } from 'zod'
import {
  buildSystemPrompt,
  localAssistantReply,
  type AssistantMessage,
  type AssistantState,
} from '@/lib/loose-ends/assistant'
import { getAssistantModel } from '@/lib/loose-ends/ai-provider'

// NB: never 'edge' with the AI SDK.
export const runtime = 'nodejs'
export const maxDuration = 30

const BodySchema = z.object({
  question: z.string().min(1).max(500),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .max(12)
    .default([]),
  state: z.object({
    discoveredClueIds: z.array(z.string()).default([]),
    solvedAccountIds: z.array(z.string()).default([]),
  }),
})

export async function POST(req: Request) {
  let parsed: z.infer<typeof BodySchema>
  try {
    parsed = BodySchema.parse(await req.json())
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const state: AssistantState = parsed.state
  const history: AssistantMessage[] = parsed.history

  const model = getAssistantModel()

  // No provider configured → deterministic, spoiler-aware fallback.
  if (!model) {
    return Response.json({ reply: localAssistantReply(state, parsed.question), source: 'local' })
  }

  try {
    const { text } = await generateText({
      model,
      system: buildSystemPrompt(state),
      messages: [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: parsed.question },
      ],
      temperature: 0.6,
      maxOutputTokens: 220,
    })
    return Response.json({ reply: text.trim(), source: 'ai' })
  } catch (err) {
    console.log('[v0] assistant error:', err instanceof Error ? err.message : String(err))
    // Graceful degradation: never break the investigation.
    return Response.json({ reply: localAssistantReply(state, parsed.question), source: 'local-fallback' })
  }
}
