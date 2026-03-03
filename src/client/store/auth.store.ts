import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '~/types'

interface AuthState {
  accessToken: string | null
  user: User | null
  setCredentials: (tokens: { accessToken: string }, user: User) => void
  clearTokens: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: null,
      user: null,
      setCredentials: (tokens, user) =>
        set({
          accessToken: tokens.accessToken,
          user: user,
        }),
      clearTokens: () =>
        set({
          accessToken: null,
          user: null,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({ accessToken: state.accessToken, user: state.user }),
    }
  )
)
