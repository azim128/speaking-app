// Translation is performed by the active AI provider, so no separate translation
// API key is needed. The system prompt constrains the model to act as a pure
// translation engine — no character personality is applied here.

import { providerFactory } from '../providers/provider-factory'

// ─── System prompts ───────────────────────────────────────────────────────────

const TRANSLATE_TO_ENGLISH_PROMPT = [
  'You are a translation engine.',
  'Your ONLY task is to translate the user\'s text into English.',
  'Return ONLY the English translation — no explanations, no notes, no added text.',
  'If the text is already in English, return it exactly as written.',
].join('\n')

const DETECT_LANGUAGE_PROMPT = [
  'Detect the language of the following text.',
  'Return ONLY the ISO 639-1 two-letter language code (e.g. "tr", "es", "de", "fr", "ja").',
  'Nothing else — no explanation, no punctuation.',
].join('\n')

// ─── Service ──────────────────────────────────────────────────────────────────

const translationService = {
  /**
   * Translate any text to English using the active AI provider.
   * If the text is already English the model returns it unchanged.
   */
  translateToEnglish: async (text: string): Promise<string> => {
    const provider = providerFactory.getProvider()
    const result = await provider.generateResponse(
      text,
      TRANSLATE_TO_ENGLISH_PROMPT,
      [], // translation requests have no conversational history
    )
    return result.trim()
  },

  /**
   * Detect the language of a text snippet.
   * Returns an ISO 639-1 code, e.g. "tr", "es", "en".
   */
  detectLanguage: async (text: string): Promise<string> => {
    const provider = providerFactory.getProvider()
    const result = await provider.generateResponse(
      text,
      DETECT_LANGUAGE_PROMPT,
      [],
    )
    return result.trim().toLowerCase().slice(0, 2)
  },
}

export { translationService }
