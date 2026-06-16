import { Link } from '@tanstack/react-router'

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold tracking-tight">Speaking App</h1>
        <p className="text-lg text-gray-500 max-w-md">
          A modern, enterprise-grade React starter built with TanStack, Zustand,
          Zod, and Tailwind CSS.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          Sign in
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs text-gray-400">
        {['React 19', 'TanStack Router', 'TanStack Query', 'Zustand', 'Zod', 'Axios', 'TypeScript', 'Tailwind CSS'].map(
          (tech) => (
            <span
              key={tech}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-medium"
            >
              {tech}
            </span>
          ),
        )}
      </div>
    </div>
  )
}

export { HomePage }
