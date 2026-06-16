type Character = {
  id: string
  name: string
  /** One-line role description shown in the UI */
  description: string
  /** Personality traits that shape the AI's system prompt */
  personality: string
  /** Speaking style that shapes tone and vocabulary */
  speakingStyle: string
  /** Emoji avatar shown in cards and chat headers */
  avatarEmoji?: string
}

export type { Character }
