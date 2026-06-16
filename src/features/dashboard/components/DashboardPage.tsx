import { useAppStore } from '@/store/app.store'

type StatCardItem = {
  label: string
  value: string
  change: string
}

const STAT_CARDS: StatCardItem[] = [
  { label: 'Total Users', value: '12,340', change: '+12%' },
  { label: 'Active Now', value: '842', change: '+3%' },
  { label: 'Revenue', value: '$48,295', change: '+8%' },
  { label: 'Growth', value: '23%', change: '+2%' },
]

function DashboardPage() {
  const theme = useAppStore((state) => state.theme)
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed)
  const toggleSidebarCollapsed = useAppStore(
    (state) => state.toggleSidebarCollapsed,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
            <p className="mt-1 text-xs font-medium text-emerald-600">
              {stat.change} from last month
            </p>
          </div>
        ))}
      </div>

      {/* App store demo */}
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        <span>
          Zustand store — theme: <strong>{theme}</strong>
        </span>
        <span>·</span>
        <button
          onClick={toggleSidebarCollapsed}
          className="font-medium text-blue-600 hover:underline"
        >
          {isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        </button>
      </div>
    </div>
  )
}

export { DashboardPage }
