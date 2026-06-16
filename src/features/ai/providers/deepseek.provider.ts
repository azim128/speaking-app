// DeepSeek Chat Completions implementation.
// DeepSeek exposes an OpenAI-compatible REST API, so the structure mirrors
// openai.provider.ts / groq.provider.ts with a different base URL and model.
//
// Recommended models:
//   deepseek-chat        — DeepSeek-V3, best general-purpose model (default)
//   deepseek-reasoner    — DeepSeek-R1, advanced reasoning / chain-of-thought
//
// Docs: https://platform.deepseek.com/api-docs/

import type { AIProvider } from './ai-provider'
import type { Message } from '../types/conversation.types'

// ─── DeepSeek REST payload types ──────────────────────────────────────────────

type DeepSeekRole = 'system' | 'user' | 'assistant'

type DeepSeekChatMessage = {
  role: DeepSeekRole
  content: string
}

type DeepSeekResponse = {
  id: string
  choices: Array<{
    message: { role: string; content: string }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// ─── Role mapping ─────────────────────────────────────────────────────────────

function toDeepSeekRole(role: Message['role']): DeepSeekRole {
  return role === 'user' ? 'user' : 'assistant'
}


// ─── Factory ──────────────────────────────────────────────────────────────────

function createDeepSeekProvider(
  apiKey: string,
  model = 'deepseek-v4-flash',
): AIProvider {
  return {
    generateResponse: async (
      message: string,
      characterPrompt: string,
      history: Message[],
    ): Promise<string> => {
      const messages: DeepSeekChatMessage[] = [
        { role: 'system', content: characterPrompt },
        ...history.map((msg) => ({
          role: toDeepSeekRole(msg.role),
          content: msg.englishText,
        })),
        { role: 'user', content: message },
      ]

      const res = await fetch(
        'https://api.deepseek.com/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            thinking: {
              type: "disabled",
            },
            reasoning_effort: "low",
            max_tokens: 512,
            temperature: 0.8,
          }),
        },
      )
      console.log(res)
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`DeepSeek API error ${res.status}: ${errText}`)
      }

      const data = await res.json() as DeepSeekResponse
      const text = data.choices[0]?.message.content

      if (!text) throw new Error('DeepSeek returned an empty response')
      return text.trim()
    },
  }
}

export { createDeepSeekProvider }
