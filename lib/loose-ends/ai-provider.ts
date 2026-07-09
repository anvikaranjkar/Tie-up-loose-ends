import 'server-only'

// ---------------------------------------------------------------------------
// Single point of AI-provider configuration. Swapping vendors means editing
// ONLY this file — the route and UI never import a provider SDK directly.
//
// Default: Anthropic Claude via the Vercel AI Gateway (zero-config in v0).
// The gateway accepts a model string, so no provider SDK import is needed and
// there is no SDK-version coupling. Override the model with ASSISTANT_MODEL.
//
// To force the deterministic local assistant (e.g. offline demos), set
// ASSISTANT_MODE=local. To swap vendors, return a different gateway string
// (e.g. 'openai/gpt-5') or wire a custom provider here.
// ---------------------------------------------------------------------------

const DEFAULT_MODEL = 'anthropic/claude-haiku-4.5'

export function isAssistantConfigured(): boolean {
  return process.env.ASSISTANT_MODE !== 'local'
}

/** Returns a gateway model string, or null to use the local fallback. */
export function getAssistantModel(): string | null {
  if (process.env.ASSISTANT_MODE === 'local') return null
  return process.env.ASSISTANT_MODEL || DEFAULT_MODEL
}
