'use client'

import Link from 'next/link'
import { Plus, TrendingUp, Shield, Settings } from 'lucide-react'

const actions = [
  {
    name: 'Create Bid',
    description: 'Bid for security leasing',
    href: '/fee-market?action=bid',
    icon: Plus,
    color: 'bg-primary-500',
  },
  {
    name: 'Offer Stake',
    description: 'Offer your stake for leasing',
    href: '/fee-market?action=offer',
    icon: TrendingUp,
    color: 'bg-green-500',
  },
  {
    name: 'Register Validator',
    description: 'Join as a validator',
    href: '/validators/register',
    icon: Shield,
    color: 'bg-blue-500',
  },
  {
    name: 'Governance',
    description: 'Participate in governance',
    href: '/governance',
    icon: Settings,
    color: 'bg-purple-500',
  },
]

export function QuickActions() {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.name}
              href={action.href}
              className="card-hover p-4 group"
            >
              <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">{action.name}</h3>
              <p className="text-sm text-gray-400">{action.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}