import { axiosInstance } from '@/lib/axios'
import type { DashboardStats } from '../types'

const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await axiosInstance.get<DashboardStats>('/dashboard/stats')
    return data
  },
}

export { dashboardService }
