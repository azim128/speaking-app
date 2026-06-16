import { createFileRoute } from '@tanstack/react-router'
import { CharacterSelector } from '@/features/ai'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* App header */}
        <div className="mb-10 text-center">
          <div className="mb-3 text-5xl">🎙️</div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Speaking App
          </h1>
          <p className="mt-2 text-gray-500">
            Practice English speaking with AI characters
          </p>
        </div>

        <CharacterSelector />
      </div>
    </div>
  )
}
