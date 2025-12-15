'use client'

import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, Activity, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

// Mock data - replace with real API calls
const leaseData = [
  { date: 'Jan', leases: 120, active: 100 },
  { date: 'Feb', leases: 150, active: 130 },
  { date: 'Mar', leases: 180, active: 160 },
  { date: 'Apr', leases: 200, active: 180 },
  { date: 'May', leases: 240, active: 220 },
  { date: 'Jun', leases: 280, active: 260 },
]

const stakeData = [
  { date: 'Jan', staked: 8.5 },
  { date: 'Feb', staked: 9.2 },
  { date: 'Mar', staked: 10.1 },
  { date: 'Apr', staked: 11.3 },
  { date: 'May', staked: 12.0 },
  { date: 'Jun', staked: 12.5 },
]

const recentLeases = [
  { id: '1', subnet: 'Avalanche Subnet A', validator: '0x1234...5678', stake: '10,000', status: 'Active' },
  { id: '2', subnet: 'Cosmos Chain B', validator: '0xabcd...efgh', stake: '5,000', status: 'Active' },
  { id: '3', subnet: 'Custom VM C', validator: '0x9876...5432', stake: '15,000', status: 'Pending' },
]

export function Dashboard() {
  const { data: leases } = useQuery({
    queryKey: ['leases'],
    queryFn: async () => leaseData,
  })

  const { data: stake } = useQuery({
    queryKey: ['stake'],
    queryFn: async () => stakeData,
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leases Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-400" />
              Lease Activity
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={leases || leaseData}>
              <defs>
                <linearGradient id="colorLeases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="leases"
                stroke="#0ea5e9"
                fillOpacity={1}
                fill="url(#colorLeases)"
              />
              <Area
                type="monotone"
                dataKey="active"
                stroke="#10b981"
                fillOpacity={0.5}
                fill="#10b981"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stake Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Total Staked
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stake || stakeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="staked"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Leases */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Leases</h3>
          <Link href="/fee-market" className="text-sm text-primary-400 hover:text-primary-300">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Subnet</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Validator</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Stake</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeases.map((lease) => (
                <tr key={lease.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                  <td className="py-3 px-4">{lease.subnet}</td>
                  <td className="py-3 px-4 font-mono text-sm">{lease.validator}</td>
                  <td className="py-3 px-4">{lease.stake} AVAX</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      lease.status === 'Active' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {lease.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}