import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { dashboardService } from '../services/dashboard.service'

function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.STATS,
    queryFn: () => dashboardService.getStats(),
  })
}

export { useDashboardStats }
