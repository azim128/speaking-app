import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants'
import { useAudioReplay } from '../hooks/useAudioReplay'
import { useConversation } from '../hooks/useConversation'
import { MessageBubble } from './MessageBubble'
import { VoiceButton } from './VoiceButton'

type ListenMode = 'auto' | 'manual'

const MODE_KEY = 'speaking-listen-mode'

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

  // ── Listen mode ─────────────────────────────────────────────────────────────
  const [listenMode, setListenMode] = useState<ListenMode>(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY)
      return saved === 'manual' ? 'manual' : 'auto'
    } catch {
      return 'auto'
    }
  })

  function toggleMode() {
    const next: ListenMode = listenMode === 'auto' ? 'manual' : 'auto'
    setListenMode(next)
    try { localStorage.setItem(MODE_KEY, next) } catch { /* ignore */ }

    // When switching to manual, stop any active listening immediately.
    if (next === 'manual') {
      stopListening()
    }
  }

  // ── Auto-listen — only active in 'auto' mode ──────────────────────────────
  const pipelineRunning = useRef(false)

  useEffect(() => {
    if (listenMode !== 'auto') {
      // Reset the pipeline flag so auto-listen starts fresh if mode switches back.
      pipelineRunning.current = false
      return
    }

    if (conversationState !== 'idle') {
      pipelineRunning.current = true
      return
    }

    // Never auto-start while a replay is starting or already playing.
    if (replayActiveRef.current || replayingId !== null) return

    if (pipelineRunning.current) {
      pipelineRunning.current = false
      const timer = setTimeout(() => {
        if (!replayActiveRef.current) {
          void startVoiceInput()
        }
      }, 600)
      return () => clearTimeout(timer)
    }

    // Very first mount in auto mode — start immediately.
    pipelineRunning.current = true
    void startVoiceInput()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationState, replayingId, listenMode])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cancel replay when AI pipeline actively processes (not during 'listening')
  useEffect(() => {
    const pipelineProcessing =
      conversationState === 'transcribing' ||
      conversationState === 'translating' ||
      conversationState === 'thinking' ||
      conversationState === 'speaking'

    if (pipelineProcessing && replayingId !== null) {
      stopReplay()
    }
  }, [conversationState, replayingId, stopReplay])

  // Enforce mic-off the moment replay starts
  useEffect(() => {
    if (replayingId !== null) {
      stopListening()
    }
  }, [replayingId, stopListening])

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
  const replayBlocked =
    conversationState === 'transcribing' ||
    conversationState === 'translating' ||
    conversationState === 'thinking' ||
    conversationState === 'speaking'

  // In manual mode the button is clickable only when idle (not processing, not replaying)
  const manualClickable = listenMode === 'manual' && !isActive && replayingId === null

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
          {/* ── Mode toggle pill ── */}
          <button
            id="listen-mode-toggle"
            type="button"
            onClick={toggleMode}
            title={listenMode === 'auto' ? 'Switch to Tap to Speak' : 'Switch to Auto-Listen'}
            className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors select-none"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full transition-colors ${
                listenMode === 'auto' ? 'bg-green-500' : 'bg-blue-500'
              }`}
            />
            {listenMode === 'auto' ? 'Auto' : 'Manual'}
          </button>

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
              {listenMode === 'auto'
                ? "I'm always listening — just speak in your native language!"
                : 'Tap the microphone button below and speak in your native language.'}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isReplaying={replayingId === message.id}
              onReplay={(id, text) => {
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

      {/* ── Footer / voice control ───────────────────────────────────────── */}
      <footer className="shrink-0 border-t border-gray-200 bg-white px-4 py-6 flex justify-center">
        <VoiceButton
          conversationState={conversationState}
          isReplaying={replayingId !== null}
          listenMode={listenMode}
          onTapToSpeak={manualClickable ? () => {
            stopReplay()
            void startVoiceInput()
          } : undefined}
          onStopSpeaking={() => {
            stopSpeaking()
          }}
        />
      </footer>
    </div>
  )
}

export { ConversationView }
