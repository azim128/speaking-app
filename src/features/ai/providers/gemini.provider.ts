// Gemini REST API implementation — uses native fetch, no SDK required.
// Docs: https://ai.google.dev/gemini-api/docs/text-generation

import type { AIProvider } from './ai-provider'
import type { Message } from '../types/conversation.types'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'

// ─── Gemini REST payload types ────────────────────────────────────────────────

type GeminiPart = { text: string }

type GeminiContent = {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

type GeminiRequest = {
  system_instruction?: { parts: GeminiPart[] }
  contents: GeminiContent[]
  generationConfig?: {
    temperature?: number
    maxOutputTokens?: number
  }
}

type GeminiResponse = {
  candidates: Array<{
    content: { role: string; parts: GeminiPart[] }
    finishReason: string
  }>
}

// ─── Role mapping ─────────────────────────────────────────────────────────────

function toGeminiRole(role: Message['role']): 'user' | 'model' {
  return role === 'user' ? 'user' : 'model'
}

// ─── Factory ─────────────────────────────────────────────────────────────────

function createGeminiProvider(
  apiKey: string,
  model = 'gemini-2.0-flash',
): AIProvider {
  return {
    generateResponse: async (
      message: string,
      characterPrompt: string,
      history: Message[],
    ): Promise<string> => {
      const contents: GeminiContent[] = [
        ...history.map((msg) => ({
          role: toGeminiRole(msg.role),
          parts: [{ text: msg.englishText }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ]

      const body: GeminiRequest = {
        system_instruction: { parts: [{ text: characterPrompt }] },
        contents,
        generationConfig: { temperature: 0.8, maxOutputTokens: 512 },
      }

      const res = await fetch(
        `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      )

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Gemini API error ${res.status}: ${errText}`)
      }

      const data: GeminiResponse = await res.json() as GeminiResponse
      const text = data.candidates[0]?.content.parts[0]?.text

      if (!text) throw new Error('Gemini returned an empty response')
      return text.trim()
    },
  }
}

export { createGeminiProvider }
