// ─── Provider Factory ─────────────────────────────────────────────────────────
//
// The single place that reads VITE_AI_PROVIDER and returns the correct
// AIProvider implementation. No other file in the app knows about concrete
// providers — they all call providerFactory.getProvider().
//
// To add a new provider:
//   1. Create src/features/ai/providers/<name>.provider.ts
//   2. Add a case to the switch below
//   3. Add the API key to env.ts and .env.example
//   4. Set VITE_AI_PROVIDER=<name> in your .env

import { env } from '@/config/env'
import type { AIProvider, AIProviderName } from '../types/ai.types'
import { createDeepSeekProvider } from './deepseek.provider'
import { createGeminiProvider } from './gemini.provider'
import { createGroqProvider } from './groq.provider'
import { createOpenAIProvider } from './openai.provider'

function getProvider(): AIProvider {
  const name = env.VITE_AI_PROVIDER as AIProviderName

  switch (name) {
    case 'gemini': {
      if (!env.VITE_GEMINI_API_KEY) {
        throw new Error(
          'VITE_GEMINI_API_KEY is not set. Add it to your .env file.',
        )
      }
      return createGeminiProvider(env.VITE_GEMINI_API_KEY)
    }

    case 'openai': {
      if (!env.VITE_OPENAI_API_KEY) {
        throw new Error(
          'VITE_OPENAI_API_KEY is not set. Add it to your .env file.',
        )
      }
      return createOpenAIProvider(env.VITE_OPENAI_API_KEY)
    }

    case 'groq': {
      if (!env.VITE_GROQ_API_KEY) {
        throw new Error(
          'VITE_GROQ_API_KEY is not set. Add it to your .env file.',
        )
      }
      return createGroqProvider(env.VITE_GROQ_API_KEY)
    }

    case 'deepseek': {
      if (!env.VITE_DEEPSEEK_API_KEY) {
        throw new Error(
          'VITE_DEEPSEEK_API_KEY is not set. Add it to your .env file.',
        )
      }
      return createDeepSeekProvider(env.VITE_DEEPSEEK_API_KEY)
    }

    // Future providers: add cases here without touching any other file.
    // case 'claude':      { ... }
    // case 'azure-openai': { ... }
    // case 'ollama':      { ... }

    default:
      throw new Error(
        `Unknown AI provider: "${name}". ` +
          'Check VITE_AI_PROVIDER in your .env file. ' +
          'Supported values: gemini, openai, groq, deepseek',
      )
  }
}

const providerFactory = { getProvider }

export { providerFactory }
