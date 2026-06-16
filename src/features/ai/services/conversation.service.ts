// conversation.service — the only layer that touches the provider factory.
//
// Flow:
//   useConversation hook
//     → conversationService.getResponse(englishText, character, history)
//       → characterService.buildSystemPrompt(character)
//       → providerFactory.getProvider()
//       → provider.generateResponse(message, systemPrompt, history)

import { providerFactory } from '../providers/provider-factory'
import { characterService } from './character.service'
import type { Character } from '../types/character.types'
import type { Message } from '../types/conversation.types'

const conversationService = {
  /**
   * Get an AI response for the current user message.
   *
   * @param englishMessage - User's message already translated to English
   * @param character      - The selected AI character (used to build the prompt)
   * @param history        - Session history EXCLUDING the current user message
   */
  getResponse: async (
    englishMessage: string,
    character: Character,
    history: Message[],
  ): Promise<string> => {
    const provider = providerFactory.getProvider()
    const systemPrompt = characterService.buildSystemPrompt(character)
    return provider.generateResponse(englishMessage, systemPrompt, history)
  },
}

export { conversationService }
