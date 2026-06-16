import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/constants'
import type { AuthUser } from '../types'

type AuthState = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
}

type AuthActions = {
  setUser: (user: AuthUser) => void
  setToken: (token: string) => void
  login: (user: AuthUser, token: string) => void
  logout: () => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      login: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
        }
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        }
        set(initialState)
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_STORAGE,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

export { useAuthStore }
export type { AuthStore, AuthState, AuthActions }
