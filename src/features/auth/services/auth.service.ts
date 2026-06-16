import { axiosInstance } from '@/lib/axios'
import type { AuthResponse, AuthUser, LoginCredentials } from '../types'

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(
      '/auth/login',
      credentials,
    )
    return data
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout')
  },

  getMe: async (): Promise<AuthUser> => {
    const { data } = await axiosInstance.get<AuthUser>('/auth/me')
    return data
  },

  refreshToken: async (token: string): Promise<{ token: string }> => {
    const { data } = await axiosInstance.post<{ token: string }>(
      '/auth/refresh',
      { token },
    )
    return data
  },
}

export { authService }
