// Anthropic Claude Messages API implementation.
// Set VITE_AI_PROVIDER=claude and VITE_CLAUDE_API_KEY to activate.
//
// Recommended models (fastest to most capable):
//   claude-haiku-4-5          — lowest latency, cheapest
//   claude-sonnet-4-5         — best balance of speed and quality (default)
//   claude-opus-4-5           — highest capability
//
// Claude uses a different API shape from OpenAI:
//   - System prompt is a top-level field, NOT a message
//   - History messages use role: 'user' | 'assistant' only
//   - Response is in content[0].text (not choices[0].message.content)
//   - Requires the 'anthropic-version' header
//   - Requires 'anthropic-dangerous-direct-browser-access: true' for browser
//
// Docs: https://docs.anthropic.com/en/api/messages

import type { AIProvider } from './ai-provider'
import type { Message } from '../types/conversation.types'

// ─── Claude REST payload types ────────────────────────────────────────────────

type ClaudeRole = 'user' | 'assistant'

type ClaudeMessage = {
  role: ClaudeRole
  content: string
}

type ClaudeResponse = {
  id: string
  type: 'message'
  role: 'assistant'
  content: Array<{
    type: 'text'
    text: string
  }>
  model: string
  stop_reason: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

// ─── Role mapping ─────────────────────────────────────────────────────────────

function toClaudeRole(role: Message['role']): ClaudeRole {
  return role === 'user' ? 'user' : 'assistant'
}

// ─── Factory ──────────────────────────────────────────────────────────────────

function createClaudeProvider(
  apiKey: string,
  model = 'claude-sonnet-4-5',
): AIProvider {
  return {
    generateResponse: async (
      message: string,
      characterPrompt: string,
      history: Message[],
    ): Promise<string> => {
      const messages: ClaudeMessage[] = [
        ...history.map((msg) => ({
          role: toClaudeRole(msg.role),
          content: msg.englishText,
        })),
        { role: 'user', content: message },
      ]

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          // Required when calling the API directly from a browser
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          system: characterPrompt,
          messages,
          max_tokens: 512,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Claude API error ${res.status}: ${errText}`)
      }

      const data = (await res.json()) as ClaudeResponse
      const text = data.content[0]?.text

      if (!text) throw new Error('Claude returned an empty response')
      return text.trim()
    },
  }
}

export { createClaudeProvider }
