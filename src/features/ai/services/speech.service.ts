// speech.service — browser Web Speech API wrapper.
//
// Current provider: Browser (SpeechRecognition + SpeechSynthesis)
// Future providers: OpenAI TTS, ElevenLabs, Azure Speech, Gemini Speech
//
// All SSR-unsafe browser API calls are guarded with typeof window checks.

// ─── Minimal SpeechRecognition types ─────────────────────────────────────────
// TypeScript's DOM lib ships SpeechRecognition behind an experimental flag in
// some versions. We declare just enough here to avoid that dependency.

type SpeechRecognitionResultItem = {
  readonly transcript: string
  readonly confidence: number
}

type SpeechRecognitionResult = {
  readonly length: number
  item(index: number): SpeechRecognitionResultItem
  [index: number]: SpeechRecognitionResultItem
}

type SpeechRecognitionResultList = {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

type SpeechRecognitionEvent = Event & {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

type SpeechRecognitionErrorEvent = Event & {
  readonly error: string
  readonly message: string
}

type SpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

type WindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionCtor
  webkitSpeechRecognition?: SpeechRecognitionCtor
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const win = window as WindowWithSpeech
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null
}

// ─── Option types ─────────────────────────────────────────────────────────────

type SpeechToTextOptions = {
  /** BCP-47 language tag, e.g. "tr-TR", "es-ES". Defaults to "tr-TR". */
  language?: string
}

type TextToSpeechOptions = {
  /** BCP-47 language tag for the output voice. Defaults to "en-US". */
  language?: string
  rate?: number
  pitch?: number
  volume?: number
}

// ─── Service ──────────────────────────────────────────────────────────────────

const speechService = {
  isSTTSupported: (): boolean => getSpeechRecognitionCtor() !== null,

  isTTSSupported: (): boolean =>
    typeof window !== 'undefined' && 'speechSynthesis' in window,

  /**
   * Open the microphone and resolve with the recognised transcript.
   * Resolves with an empty string if the user doesn't speak.
   */
  startListening: (options: SpeechToTextOptions = {}): Promise<string> => {
    return new Promise((resolve, reject) => {
      const Ctor = getSpeechRecognitionCtor()
      if (!Ctor) {
        reject(
          new Error(
            'Speech Recognition is not supported in this browser. Try Chrome or Edge.',
          ),
        )
        return
      }

      const recognition: SpeechRecognitionInstance = new Ctor()
      recognition.lang = options.language ?? 'tr-TR'
      recognition.continuous = false
      recognition.interimResults = false

      let hasResult = false

      recognition.onresult = (event) => {
        hasResult = true
        const results = Array.from(
          { length: event.results.length },
          (_, i) => event.results[i]?.[0]?.transcript ?? '',
        )
        resolve(results.join('').trim())
      }

      recognition.onerror = (event) => {
        // 'no-speech' is not a real error — resolve with empty string
        if (event.error === 'no-speech') {
          resolve('')
        } else {
          reject(new Error(`Speech recognition error: ${event.error}`))
        }
      }

      recognition.onend = () => {
        if (!hasResult) resolve('')
      }

      recognition.start()
    })
  },

  /**
   * Synthesise text using the browser TTS engine.
   * Cancels any in-progress speech before starting.
   */
  speak: (text: string, options: TextToSpeechOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        reject(new Error('Text-to-Speech is not supported in this browser.'))
        return
      }

      window.speechSynthesis.cancel() // stop any previous utterance

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = options.language ?? 'en-US'
      utterance.rate = options.rate ?? 0.92
      utterance.pitch = options.pitch ?? 1.0
      utterance.volume = options.volume ?? 1.0

      utterance.onend = () => resolve()
      utterance.onerror = (e) => {
        // 'interrupted' and 'canceled' are intentional-stop codes, not real
        // errors. They fire when speechSynthesis.cancel() is called externally
        // (e.g. switching replay messages, starting a new voice input).
        // Treat them the same as a clean end — identical to how 'no-speech'
        // is handled in startListening().
        if (e.error === 'interrupted' || e.error === 'canceled') {
          resolve()
          return
        }
        reject(new Error(`TTS error: ${e.error}`))
      }

      window.speechSynthesis.speak(utterance)
    })
  },

  stopSpeaking: (): void => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  },
}

export { speechService }
export type { SpeechToTextOptions, TextToSpeechOptions }
