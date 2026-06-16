import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants'
import { useCharacterStore, useAllCharacters } from '../store/character.store'
import type { Character } from '../types/character.types'

function useCharacter() {
  const navigate = useNavigate()
  const selectedCharacter = useCharacterStore((state) => state.selectedCharacter)
  const setSelectedCharacter = useCharacterStore(
    (state) => state.setSelectedCharacter,
  )
  const clearSelection = useCharacterStore((state) => state.clearSelection)
  const characters = useAllCharacters()

  /** Select a character and navigate to the speaking screen. */
  const selectCharacter = useCallback(
    (character: Character) => {
      setSelectedCharacter(character)
      void navigate({ to: ROUTES.SPEAK })
    },
    [setSelectedCharacter, navigate],
  )

  return {
    characters,
    selectedCharacter,
    selectCharacter,
    clearSelection,
  }
}

export { useCharacter }
