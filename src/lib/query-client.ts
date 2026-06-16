import { QueryClient } from '@tanstack/react-query'

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data stays fresh for 5 minutes before a background refetch
        staleTime: 1000 * 60 * 5,
        // Unused cache kept for 10 minutes on the client
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}

// Singleton on the client; new instance per request on the server
let browserQueryClient: QueryClient | undefined

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

export { getQueryClient }
