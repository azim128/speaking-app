import type { ReactNode } from 'react'

// NOTE: In TanStack Start (SSR mode), routing is handled automatically by the
// framework using the router configured in src/router.tsx.
// This component is a thin wrapper provided for client-side-only (CSR) scenarios
// or for testing environments where you want to control the router externally.

type RouterProviderProps = {
  children: ReactNode
}

function RouterProvider({ children }: RouterProviderProps) {
  return <>{children}</>
}

export { RouterProvider }
