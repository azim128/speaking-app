import { cn } from '@/lib/utils'
import type { Character } from '../types/character.types'

type CharacterCardProps = {
  character: Character
  isSelected?: boolean
  onSelect: (character: Character) => void
}

function CharacterCard({
  character,
  isSelected = false,
  onSelect,
}: CharacterCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(character)}
      className={cn(
        'group relative flex w-full flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400',
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-50',
      )}
      aria-pressed={isSelected}
    >
      {/* Selected badge */}
      {isSelected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
          ✓
        </span>
      )}

      {/* Avatar */}
      <span className="text-5xl" role="img" aria-label={character.name}>
        {character.avatarEmoji ?? '🤖'}
      </span>

      {/* Identity */}
      <div>
        <h3 className="text-base font-semibold text-gray-900">{character.name}</h3>
        <p className="mt-0.5 text-xs font-medium text-blue-600">
          {character.description}
        </p>
      </div>

      {/* Speaking style preview */}
      <p className="text-xs leading-relaxed text-gray-500">
        {character.speakingStyle}
      </p>
    </button>
  )
}

export { CharacterCard }
