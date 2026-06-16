// Groq Chat Completions implementation.
// Groq uses an OpenAI-compatible API, so the shape is identical to openai.provider.ts
// but the base URL and available models differ.
//
// Recommended models (fastest to most capable):
//   llama-3.1-8b-instant      — lowest latency, good for quick replies
//   llama-3.3-70b-versatile   — best quality + still very fast (default)
//   llama3-70b-8192           — strong general purpose
//   mixtral-8x7b-32768        — large context window
//
// Docs: https://console.groq.com/docs/openai

import type { AIProvider } from './ai-provider'
import type { Message } from '../types/conversation.types'

// ─── Groq REST payload types ──────────────────────────────────────────────────

type GroqRole = 'system' | 'user' | 'assistant'

type GroqChatMessage = {
  role: GroqRole
  content: string
}

type GroqResponse = {
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

function toGroqRole(role: Message['role']): GroqRole {
  return role === 'user' ? 'user' : 'assistant'
}

// ─── Factory ─────────────────────────────────────────────────────────────────

function createGroqProvider(
  apiKey: string,
  model = 'llama-3.3-70b-versatile',
): AIProvider {
  return {
    generateResponse: async (
      message: string,
      characterPrompt: string,
      history: Message[],
    ): Promise<string> => {
      const messages: GroqChatMessage[] = [
        { role: 'system', content: characterPrompt },
        ...history.map((msg) => ({
          role: toGroqRole(msg.role),
          content: msg.englishText,
        })),
        { role: 'user', content: message },
      ]

      const res = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: 512,
            temperature: 0.8,
          }),
        },
      )

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Groq API error ${res.status}: ${errText}`)
      }

      const data = await res.json() as GroqResponse
      const text = data.choices[0]?.message.content

      if (!text) throw new Error('Groq returned an empty response')
      return text.trim()
    },
  }
}

export { createGroqProvider }
