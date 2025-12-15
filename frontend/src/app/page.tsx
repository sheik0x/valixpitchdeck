import { Dashboard } from '@/components/dashboard/Dashboard'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { QuickActions } from '@/components/dashboard/QuickActions'

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-gradient">
          Unified Security Layer
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Generalized, Economically Unified Security Layer for Heterogeneous Subnets
        </p>
      </div>

      <StatsOverview />
      <QuickActions />
      <Dashboard />
    </div>
  )
}