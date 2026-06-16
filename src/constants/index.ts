const APP_NAME = 'Speaking App' as const
const APP_VERSION = '1.0.0' as const

const ROUTES = {
  HOME: '/',
  SPEAK: '/speak',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
} as const

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  APP_STORAGE: 'app-storage',
  AUTH_STORAGE: 'auth-storage',
  CHARACTER_STORAGE: 'character-storage',
} as const

const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
  },
  DASHBOARD: {
    STATS: ['dashboard', 'stats'] as const,
  },
} as const

export { APP_NAME, APP_VERSION, ROUTES, STORAGE_KEYS, QUERY_KEYS }
