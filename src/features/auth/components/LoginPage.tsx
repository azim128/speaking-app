import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLogin } from '../hooks/use-login'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loginMutation = useLogin()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loginMutation.isError && (
          <p role="alert" className="text-sm text-red-600">
            {loginMutation.error?.message ?? 'Something went wrong. Please try again.'}
          </p>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

export { LoginPage }
