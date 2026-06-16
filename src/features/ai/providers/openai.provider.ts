// OpenAI Chat Completions implementation.
// Set VITE_AI_PROVIDER=openai and VITE_OPENAI_API_KEY to activate.
// Docs: https://platform.openai.com/docs/api-reference/chat

import type { AIProvider } from './ai-provider'
import type { Message } from '../types/conversation.types'

// ─── OpenAI REST payload types ────────────────────────────────────────────────

type OpenAIRole = 'system' | 'user' | 'assistant'

type OpenAIChatMessage = {
  role: OpenAIRole
  content: string
}

type OpenAIResponse = {
  choices: Array<{
    message: { role: string; content: string }
    finish_reason: string
  }>
}

// ─── Role mapping ─────────────────────────────────────────────────────────────

function toOpenAIRole(role: Message['role']): OpenAIRole {
  return role === 'user' ? 'user' : 'assistant'
}

// ─── Factory ─────────────────────────────────────────────────────────────────

function createOpenAIProvider(
  apiKey: string,
  model = 'gpt-4o-mini',
  baseUrl = 'https://api.openai.com/v1',
): AIProvider {
  return {
    generateResponse: async (
      message: string,
      characterPrompt: string,
      history: Message[],
    ): Promise<string> => {
      const messages: OpenAIChatMessage[] = [
        { role: 'system', content: characterPrompt },
        ...history.map((msg) => ({
          role: toOpenAIRole(msg.role),
          content: msg.englishText,
        })),
        { role: 'user', content: message },
      ]

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, max_tokens: 512 }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`OpenAI API error ${res.status}: ${errText}`)
      }

      const data: OpenAIResponse = await res.json() as OpenAIResponse
      const text = data.choices[0]?.message.content

      if (!text) throw new Error('OpenAI returned an empty response')
      return text.trim()
    },
  }
}

export { createOpenAIProvider }
