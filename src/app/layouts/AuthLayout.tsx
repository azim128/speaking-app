import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}

export { AuthLayout }
