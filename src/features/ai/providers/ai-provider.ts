import type { AIProvider } from '../types/ai.types'

// ─── Contract re-export ───────────────────────────────────────────────────────
// Consumers import the type from here; they never reference a concrete provider.
export type { AIProvider }

// ─── Type guard ───────────────────────────────────────────────────────────────

function isAIProvider(value: unknown): value is AIProvider {
  return (
    typeof value === 'object' &&
    value !== null &&
    'generateResponse' in value &&
    typeof (value as AIProvider).generateResponse === 'function'
  )
}

export { isAIProvider }
