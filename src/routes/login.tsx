import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/app/layouts'
import { LoginPage } from '@/features/auth'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  )
}
