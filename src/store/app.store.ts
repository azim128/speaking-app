import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

type AppState = {
  theme: Theme
  isSidebarOpen: boolean
  isSidebarCollapsed: boolean
}

type AppActions = {
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  reset: () => void
}

type AppStore = AppState & AppActions

const initialState: AppState = {
  theme: 'system',
  isSidebarOpen: true,
  isSidebarCollapsed: false,
}

const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,

      setTheme: (theme) => set({ theme }),

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      toggleSidebarCollapsed: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      reset: () => set(initialState),
    }),
    {
      name: 'app-storage',
      // Only persist the theme preference; sidebar state is session-only
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)

export { useAppStore }
export type { AppStore, AppState, AppActions, Theme }
