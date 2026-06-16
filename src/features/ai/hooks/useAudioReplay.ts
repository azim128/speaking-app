import { useState, useCallback, useRef } from 'react'
import { speechService } from '../services/speech.service'

type UseAudioReplayReturn = {
  /** ID of the message currently being replayed, or null if idle. */
  replayingId: string | null
  /**
   * True synchronously as soon as replay() is called — before React re-renders.
   * Use this ref to block the auto-listen effect from racing with replay start.
   */
  replayActiveRef: React.MutableRefObject<boolean>
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

  // Synchronous guard — set immediately when replay starts, before React
  // re-renders. The auto-listen effect reads this ref to avoid racing with
  // the async state update.
  const replayActiveRef = useRef(false)

  const stop = useCallback(() => {
    replayActiveRef.current = false
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

      // Mark replay as active SYNCHRONOUSLY before any state update or async work,
      // so the auto-listen effect immediately sees this ref as true.
      replayActiveRef.current = true

      // Cancel any in-progress speech (pipeline or previous replay)
      speechService.stopSpeaking()
      setReplayingId(id)

      // Delay the actual speak() call by one tick.
      //
      // Chrome has a known bug where calling speechSynthesis.speak() in the same
      // synchronous block as cancel() causes the utterance to fire onerror('canceled')
      // immediately — before it ever produces audio. A short setTimeout breaks that
      // timing and lets Chrome clear its TTS pipeline first.
      setTimeout(() => {
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
            replayActiveRef.current = false
            setReplayingId((current) => (current === id ? null : current))
          })
      }, 50)
    },
    [replayingId, stop],
  )

  return { replayingId, replayActiveRef, replay, stop }
}

export { useAudioReplay }
