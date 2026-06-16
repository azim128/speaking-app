import { cn } from '@/lib/utils'
import type { ConversationState } from '../types/conversation.types'

type VoiceButtonProps = {
  conversationState: ConversationState
  /** True when a message replay is actively playing — mic is off during this time. */
  isReplaying?: boolean
  onStopSpeaking: () => void
}

// ─── State metadata ───────────────────────────────────────────────────────────

const STATE_CONFIG: Record<
  ConversationState,
  { label: string; icon: string; pulse: boolean; color: string; ring: string }
> = {
  idle: {
    label: 'Starting…',
    icon: '🎤',
    pulse: false,
    color: 'bg-blue-500',
    ring: 'ring-blue-300',
  },
  listening: {
    label: 'Listening…',
    icon: '🎙️',
    pulse: true,
    color: 'bg-red-500',
    ring: 'ring-red-300',
  },
  transcribing: {
    label: 'Processing…',
    icon: '⏳',
    pulse: true,
    color: 'bg-amber-500',
    ring: 'ring-amber-300',
  },
  translating: {
    label: 'Translating…',
    icon: '🔄',
    pulse: true,
    color: 'bg-amber-500',
    ring: 'ring-amber-300',
  },
  thinking: {
    label: 'Thinking…',
    icon: '💭',
    pulse: true,
    color: 'bg-purple-500',
    ring: 'ring-purple-300',
  },
  speaking: {
    label: 'Speaking…',
    icon: '🔊',
    pulse: true,
    color: 'bg-emerald-500',
    ring: 'ring-emerald-300',
  },
}

function VoiceButton({ conversationState, isReplaying = false, onStopSpeaking }: VoiceButtonProps) {
  // Replay overrides conversationState display — mic is off, audio is playing.
  const effectiveConfig = isReplaying
    ? { label: 'Replaying…', icon: '🔁', pulse: true, color: 'bg-teal-500', ring: 'ring-teal-300' }
    : STATE_CONFIG[conversationState]

  const { label, icon, pulse, color, ring } = effectiveConfig

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* ── Orb ── */}
      <div className="relative flex items-center justify-center">
        {/* Outer ripple ring */}
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex h-28 w-28 rounded-full opacity-25 animate-ping',
              color,
            )}
          />
        )}
        {/* Secondary ring */}
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex h-24 w-24 rounded-full opacity-20 animate-ping animation-delay-150',
              color,
            )}
            style={{ animationDelay: '0.15s' }}
          />
        )}

        {/* Main orb — always visible, never a clickable "tap to speak" button */}
        <div
          aria-live="polite"
          aria-label={label}
          className={cn(
            'relative z-10 flex h-20 w-20 items-center justify-center rounded-full text-3xl shadow-lg transition-all duration-300',
            color,
            pulse && cn('ring-4', ring),
          )}
        >
          {icon}
        </div>
      </div>

      {/* ── State label ── */}
      <span className="text-sm font-semibold text-gray-600 tracking-wide">
        {label}
      </span>

      {/* ── Stop button — only shown while AI is speaking ── */}
      {conversationState === 'speaking' && (
        <button
          id="stop-speaking-btn"
          type="button"
          onClick={onStopSpeaking}
          className="mt-1 rounded-full border border-emerald-300 bg-white px-5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 active:scale-95 transition-all duration-150"
        >
          ⏹ Stop &amp; listen again
        </button>
      )}
    </div>
  )
}

export { VoiceButton }
