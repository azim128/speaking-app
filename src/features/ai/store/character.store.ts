import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/constants'
import { characterService } from '../services/character.service'
import type { Character } from '../types/character.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type CharacterStoreState = {
  selectedCharacter: Character | null
  customCharacters: Character[]
}

type CharacterStoreActions = {
  setSelectedCharacter: (character: Character) => void
  addCustomCharacter: (character: Character) => void
  clearSelection: () => void
}

type CharacterStore = CharacterStoreState & CharacterStoreActions

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: CharacterStoreState = {
  selectedCharacter: null,
  customCharacters: [],
}

// ─── Store ────────────────────────────────────────────────────────────────────
// Persists selected character and custom characters across page refreshes.

const useCharacterStore = create<CharacterStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedCharacter: (character) => set({ selectedCharacter: character }),

      addCustomCharacter: (character) =>
        set((state) => ({
          customCharacters: [...state.customCharacters, character],
        })),

      clearSelection: () => set({ selectedCharacter: null }),
    }),
    {
      name: STORAGE_KEYS.CHARACTER_STORAGE,
      partialize: (state) => ({
        selectedCharacter: state.selectedCharacter,
        customCharacters: state.customCharacters,
      }),
    },
  ),
)

// ─── Derived selector ─────────────────────────────────────────────────────────
// Returns default characters merged with any user-created custom characters.

function useAllCharacters(): Character[] {
  const customCharacters = useCharacterStore((state) => state.customCharacters)
  return [...characterService.getDefaultCharacters(), ...customCharacters]
}

export { useCharacterStore, useAllCharacters }
export type { CharacterStore, CharacterStoreState, CharacterStoreActions }
