'use client'

import { Shield, Users, TrendingUp, DollarSign } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

const stats = [
  {
    name: 'Total Validators',
    value: '1,234',
    change: '+12.5%',
    icon: Users,
    color: 'text-blue-400',
  },
  {
    name: 'Active Leases',
    value: '456',
    change: '+8.2%',
    icon: Shield,
    color: 'text-green-400',
  },
  {
    name: 'Total Staked',
    value: '$12.5M',
    change: '+15.3%',
    icon: DollarSign,
    color: 'text-yellow-400',
  },
  {
    name: 'Security Score',
    value: '98.7%',
    change: '+2.1%',
    icon: TrendingUp,
    color: 'text-purple-400',
  },
]

export function StatsOverview() {
  // In production, fetch real data
  const { data } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return stats
    },
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {(data || stats).map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.name} className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{stat.name}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-green-400 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`p-3 rounded-lg bg-dark-700 ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}