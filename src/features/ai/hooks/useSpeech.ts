import { useState, useCallback } from 'react'
import { speechService } from '../services/speech.service'

type UseSpeechReturn = {
  isListening: boolean
  isSpeaking: boolean
  isSTTSupported: boolean
  isTTSSupported: boolean
  /** Start microphone capture; resolves with the transcript. */
  startListening: (language?: string) => Promise<string>
  /** Convert text to speech using the active TTS provider. */
  speak: (text: string) => Promise<void>
  stopSpeaking: () => void
}

function useSpeech(): UseSpeechReturn {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const startListening = useCallback(
    async (language = 'tr-TR'): Promise<string> => {
      setIsListening(true)
      try {
        return await speechService.startListening({ language })
      } finally {
        setIsListening(false)
      }
    },
    [],
  )

  const speak = useCallback(async (text: string): Promise<void> => {
    setIsSpeaking(true)
    try {
      await speechService.speak(text, { language: 'en-US' })
    } finally {
      setIsSpeaking(false)
    }
  }, [])

  const stopSpeaking = useCallback((): void => {
    speechService.stopSpeaking()
    setIsSpeaking(false)
  }, [])

  return {
    isListening,
    isSpeaking,
    isSTTSupported: speechService.isSTTSupported(),
    isTTSSupported: speechService.isTTSSupported(),
    startListening,
    speak,
    stopSpeaking,
  }
}

export { useSpeech }
