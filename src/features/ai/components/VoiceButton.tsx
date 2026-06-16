import { cn } from '@/lib/utils'
import type { ConversationState } from '../types/conversation.types'

type VoiceButtonProps = {
  conversationState: ConversationState
  onClick: () => void
  disabled?: boolean
}

// ─── State → label & colour maps ─────────────────────────────────────────────

const STATE_LABEL: Record<ConversationState, string> = {
  idle: 'Tap to Speak',
  listening: 'Listening…',
  transcribing: 'Processing…',
  translating: 'Translating…',
  thinking: 'Thinking…',
  speaking: 'Speaking…',
}

const STATE_ICON: Record<ConversationState, string> = {
  idle: '🎤',
  listening: '🎙️',
  transcribing: '⏳',
  translating: '🔄',
  thinking: '💭',
  speaking: '🔊',
}

function VoiceButton({
  conversationState,
  onClick,
  disabled = false,
}: VoiceButtonProps) {
  const isActive = conversationState !== 'idle'
  const isClickable = !disabled && !isActive

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Ripple ring — only visible when active */}
      <div className="relative flex items-center justify-center">
        {isActive && (
          <span className="absolute inline-flex h-24 w-24 rounded-full bg-blue-400 opacity-30 animate-ping" />
        )}

        <button
          type="button"
          onClick={onClick}
          disabled={!isClickable}
          aria-label={STATE_LABEL[conversationState]}
          className={cn(
            'relative z-10 flex h-20 w-20 items-center justify-center rounded-full text-3xl shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400',
            isClickable
              ? 'cursor-pointer bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200'
              : 'cursor-not-allowed',
            conversationState === 'listening' &&
              'bg-red-500 shadow-red-200',
            conversationState === 'thinking' &&
              'bg-purple-500 shadow-purple-200',
            conversationState === 'speaking' &&
              'bg-emerald-500 shadow-emerald-200',
            (conversationState === 'translating' ||
              conversationState === 'transcribing') &&
              'bg-amber-500 shadow-amber-200',
            disabled && 'bg-gray-300 shadow-none',
          )}
        >
          {STATE_ICON[conversationState]}
        </button>
      </div>

      <span className="text-sm font-medium text-gray-500">
        {STATE_LABEL[conversationState]}
      </span>
    </div>
  )
}

export { VoiceButton }
