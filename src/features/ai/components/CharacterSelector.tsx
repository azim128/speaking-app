import { useCharacter } from '../hooks/useCharacter'
import { CharacterCard } from './CharacterCard'

function CharacterSelector() {
  const { characters, selectedCharacter, selectCharacter } = useCharacter()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Choose Your AI Partner
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Select a character to start practising your English speaking
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            isSelected={selectedCharacter?.id === character.id}
            onSelect={selectCharacter}
          />
        ))}
      </div>

      {selectedCharacter && (
        <p className="text-center text-sm text-gray-400">
          Currently talking to{' '}
          <strong className="text-gray-700">{selectedCharacter.name}</strong> —
          click a card to switch characters
        </p>
      )}
    </div>
  )
}

export { CharacterSelector }
