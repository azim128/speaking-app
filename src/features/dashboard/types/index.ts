export type DashboardStats = {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  growth: number
}

export type StatCard = {
  label: string
  value: string
  change: string
  positive: boolean
}
