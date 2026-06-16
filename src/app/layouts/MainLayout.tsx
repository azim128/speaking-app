import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useAppStore } from '@/store/app.store'

type MainLayoutProps = {
  children: ReactNode
}

const NAV_LINKS = [
  { to: '/' as const, label: 'Home' },
  { to: '/dashboard' as const, label: 'Dashboard' },
  { to: '/login' as const, label: 'Login' },
]

function MainLayout({ children }: MainLayoutProps) {
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed)
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)

  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={[
          'flex flex-col border-r border-gray-200 bg-white transition-all duration-200',
          isSidebarCollapsed ? 'w-14' : 'w-60',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          {!isSidebarCollapsed && (
            <span className="text-sm font-semibold text-gray-900">
              Speaking App
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-2">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              activeProps={{ className: 'bg-blue-50 text-blue-700' }}
            >
              {!isSidebarCollapsed && label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={() => setTheme(nextTheme)}
            className="w-full rounded-md px-3 py-2 text-left text-xs text-gray-500 hover:bg-gray-100"
          >
            {!isSidebarCollapsed && `Theme: ${theme}`}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}

export { MainLayout }
