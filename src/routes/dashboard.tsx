import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/app/layouts'
import { DashboardPage } from '@/features/dashboard'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <MainLayout>
      <DashboardPage />
    </MainLayout>
  )
}
