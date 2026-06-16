export type AuthUser = {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'guest'
  createdAt: string
  updatedAt: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type AuthResponse = {
  user: AuthUser
  token: string
  expiresIn: number
}

export type AuthError = {
  message: string
  code: string
}
