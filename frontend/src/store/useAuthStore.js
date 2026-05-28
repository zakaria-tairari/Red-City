import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authService from '@/services/auth'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login(credentials)
          // The backend returns { status: 'success', message: '...', data: user }
          set({ user: response.data, isAuthenticated: true, isLoading: false })
          return { success: true, user: response.data }
        } catch (error) {
          set({ isLoading: false, error: error.response?.data?.message || 'Login failed' })
          return { success: false, error: error.response?.data?.message || 'Login failed' }
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          await authService.register(userData)
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false, error: error.response?.data?.message || 'Registration failed' })
          return { success: false, error: error.response?.data?.message || 'Registration failed' }
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const user = await authService.getProfile()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },
      
      resendVerification: async (email) => {
        try {
          const response = await authService.resendVerificationEmail(email)
          return { success: true, message: response.message }
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Failed to resend' }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
