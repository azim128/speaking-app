import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ROUTES } from '@/constants'
import { useCharacterStore, ConversationView } from '@/features/ai'

export const Route = createFileRoute('/speak')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const selectedCharacter = useCharacterStore((s) => s.selectedCharacter)

  // Client-side guard: redirect to home if no character is selected.
  // We do this in the component (not beforeLoad) to stay SSR-safe —
  // Zustand's persist middleware hasn't loaded from localStorage on the server.
  useEffect(() => {
    if (!selectedCharacter) {
      void navigate({ to: ROUTES.HOME, replace: true })
    }
  }, [selectedCharacter, navigate])

  if (!selectedCharacter) return null

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <ConversationView />
    </div>
  )
}
