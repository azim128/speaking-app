import { useState, useCallback } from 'react'
import { speechService } from '../services/speech.service'

type UseAudioReplayReturn = {
  /** ID of the message currently being replayed, or null if idle. */
  replayingId: string | null
  /**
   * Start replaying a message.
   * Clicking the same message again while it is playing stops it (toggle).
   * Clicking a different message while one is playing cancels the first and starts the second.
   */
  replay: (id: string, text: string) => void
  /** Cancel any active replay immediately. */
  stop: () => void
}

function useAudioReplay(): UseAudioReplayReturn {
  const [replayingId, setReplayingId] = useState<string | null>(null)

  const stop = useCallback(() => {
    speechService.stopSpeaking()
    setReplayingId(null)
  }, [])

  const replay = useCallback(
    (id: string, text: string) => {
      // Toggle off: clicking an already-playing message stops it
      if (replayingId === id) {
        stop()
        return
      }

      // Cancel any in-progress speech (pipeline or previous replay)
      speechService.stopSpeaking()
      setReplayingId(id)

      void speechService
        .speak(text, { language: 'en-US', rate: 0.92 })
        .catch(() => {
          // Suppress any remaining rejections (e.g. unsupported browser error).
          // 'interrupted' and 'canceled' are already resolved in speech.service,
          // so this catch is purely defensive for genuine TTS failures.
        })
        .finally(() => {
          // Use the functional updater so we never clear a *different* message's
          // state in case the user switched to another replay mid-flight.
          setReplayingId((current) => (current === id ? null : current))
        })
    },
    [replayingId, stop],
  )

  return { replayingId, replay, stop }
}

export { useAudioReplay }
