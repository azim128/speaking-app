import { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants'
import { useAudioReplay } from '../hooks/useAudioReplay'
import { useConversation } from '../hooks/useConversation'
import { MessageBubble } from './MessageBubble'
import { VoiceButton } from './VoiceButton'

function ConversationView() {
  const navigate = useNavigate()
  const {
    messages,
    conversationState,
    error,
    selectedCharacter,
    startVoiceInput,
    stopSpeaking,
    stopListening,
    clearMessages,
  } = useConversation()

  const bottomRef = useRef<HTMLDivElement>(null)
  const { replayingId, replayActiveRef, replay, stop: stopReplay } = useAudioReplay()

  // Prevent concurrent pipeline starts — guard against the effect firing twice
  // in strict mode or while a pipeline is already running.
  const pipelineRunning = useRef(false)

  // ── Auto-start listening whenever the pipeline is idle ──────────────────────
  // Guards:
  //   1. replayActiveRef.current — set SYNCHRONOUSLY by replay() before React
  //      re-renders, so we never race with async abort completions.
  //   2. replayingId state — secondary check once React has settled.
  useEffect(() => {
    if (conversationState !== 'idle') {
      pipelineRunning.current = true
      return
    }

    // Never auto-start while a replay is starting or already playing.
    if (replayActiveRef.current || replayingId !== null) return

    if (pipelineRunning.current) {
      // Pipeline just finished — brief settle delay before reopening the mic.
      pipelineRunning.current = false
      const timer = setTimeout(() => {
        // Double-check replay hasn't started during the delay.
        if (!replayActiveRef.current) {
          void startVoiceInput()
        }
      }, 600)
      return () => clearTimeout(timer)
    }

    // Very first mount — start immediately.
    pipelineRunning.current = true
    void startVoiceInput()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationState, replayingId])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cancel an active replay when the main pipeline becomes active.
  useEffect(() => {
    if (conversationState !== 'idle' && replayingId !== null) {
      stopReplay()
    }
  }, [conversationState, replayingId, stopReplay])

  // Guard: should not be reachable without a character, but just in case
  if (!selectedCharacter) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <p className="text-gray-500">No character selected.</p>
        <button
          type="button"
          onClick={() => void navigate({ to: ROUTES.HOME })}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Choose a Character
        </button>
      </div>
    )
  }

  const isActive = conversationState !== 'idle'
  // Replay is blocked only during processing/thinking/speaking — NOT during listening.
  // During listening the user can click replay to abort the mic and hear the message again.
  const replayBlocked =
    conversationState === 'transcribing' ||
    conversationState === 'translating' ||
    conversationState === 'thinking' ||
    conversationState === 'speaking'

  return (
    <div className="flex h-full flex-col">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shrink-0">
        <span
          className="text-2xl"
          role="img"
          aria-label={selectedCharacter.name}
        >
          {selectedCharacter.avatarEmoji ?? '🤖'}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">
            {selectedCharacter.name}
          </h2>
          <p className="text-xs text-gray-500 truncate">
            {selectedCharacter.description}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearMessages}
            disabled={messages.length === 0 || isActive}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: ROUTES.HOME })}
            disabled={isActive}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Change
          </button>
        </div>
      </header>

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      <section className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center py-12">
            <span className="text-5xl" role="img" aria-label="wave">
              {selectedCharacter.avatarEmoji ?? '🤖'}
            </span>
            <p className="font-medium text-gray-700">
              Hi! I'm {selectedCharacter.name}.
            </p>
            <p className="max-w-xs text-sm text-gray-400">
              I'm listening — just speak in your native language and I'll
              respond in English!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isReplaying={replayingId === message.id}
              onReplay={(id, text) => {
                // Always abort mic before replay — stopListening is a no-op
                // if the mic isn't currently open.
                stopListening()
                replay(id, text)
              }}
              replayDisabled={replayBlocked}
            />
          ))
        )}

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <strong>Error: </strong>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      {/* ── Status orb ───────────────────────────────────────────────────── */}
      <footer className="shrink-0 border-t border-gray-200 bg-white px-4 py-6 flex justify-center">
        <VoiceButton
          conversationState={conversationState}
          onStopSpeaking={() => {
            stopSpeaking()
          }}
        />
      </footer>
    </div>
  )
}

export { ConversationView }
