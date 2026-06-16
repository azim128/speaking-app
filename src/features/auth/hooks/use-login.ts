import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'
import type { LoginCredentials } from '../types'

function useLogin() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (data) => {
      login(data.user, data.token)
      void navigate({ to: '/dashboard' })
    },
  })
}

export { useLogin }
