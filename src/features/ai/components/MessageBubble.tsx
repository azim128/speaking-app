import { Volume2, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message } from '../types/conversation.types'

type MessageBubbleProps = {
  message: Message
  /** True when this specific message is currently being spoken. */
  isReplaying?: boolean
  /**
   * Called when the replay button is pressed.
   * The hook decides whether to start or stop based on current state.
   */
  onReplay?: (id: string, text: string) => void
  /** Disables the replay button when the main conversation pipeline is active. */
  replayDisabled?: boolean
}

function MessageBubble({
  message,
  isReplaying = false,
  onReplay,
  replayDisabled = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'

  const formattedTime = new Date(message.createdAt).toLocaleTimeString(
    'en-US',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  )

  // The button is disabled only when the pipeline is active AND this message
  // is not the one currently replaying (so the stop action always works).
  const buttonDisabled = replayDisabled && !isReplaying

  return (
    <div
      className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* ── Avatar ──────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 border border-gray-200',
        )}
      >
        {isUser ? '👤' : '🤖'}
      </div>

      {/* ── Bubble + footer ─────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex max-w-[75%] flex-col gap-1',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'rounded-tr-sm bg-blue-600 text-white'
              : 'rounded-tl-sm border border-gray-200 bg-white text-gray-900 shadow-sm',
          )}
        >
          <p>{message.englishText}</p>

          {/* Original text — only when it differs from the English translation */}
          {message.originalText !== message.englishText && (
            <p
              className={cn(
                'mt-1.5 border-t pt-1.5 text-xs',
                isUser
                  ? 'border-blue-500 text-blue-200'
                  : 'border-gray-100 text-gray-400',
              )}
            >
              <span className="font-medium">Original: </span>
              {message.originalText}
            </p>
          )}
        </div>

        {/* Footer: timestamp + replay button */}
        <div className="flex items-center gap-1.5 px-1">
          <time className="text-xs text-gray-400" dateTime={message.createdAt}>
            {formattedTime}
          </time>

          {onReplay && (
            <button
              type="button"
              onClick={() => onReplay(message.id, message.englishText)}
              disabled={buttonDisabled}
              aria-label={isReplaying ? 'Stop playback' : 'Replay message'}
              title={isReplaying ? 'Stop' : 'Replay'}
              className={cn(
                'flex items-center justify-center rounded-full p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                isReplaying
                  ? 'text-blue-500 animate-pulse hover:text-blue-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                buttonDisabled &&
                  'cursor-not-allowed opacity-40 pointer-events-none',
              )}
            >
              {isReplaying ? (
                <Square className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export { MessageBubble }
