'use client'

import { useQuery } from '@tanstack/react-query'
import { Search, Plus, Shield, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { formatAddress, formatNumber } from '@/lib/utils'
import Link from 'next/link'

// Mock data
const mockValidators = [
  {
    address: '0x1234567890123456789012345678901234567890',
    totalStake: 100000,
    availableStake: 50000,
    leasedStake: 50000,
    activeLeases: 5,
    uptime: 99.8,
    reputation: 95,
  },
  {
    address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    totalStake: 75000,
    availableStake: 25000,
    leasedStake: 50000,
    activeLeases: 3,
    uptime: 99.5,
    reputation: 92,
  },
]

export default function ValidatorsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: validators } = useQuery({
    queryKey: ['validators'],
    queryFn: async () => mockValidators,
  })

  const filteredValidators = (validators || []).filter(v =>
    v.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Validators</h1>
          <p className="text-gray-400">
            Manage and monitor validators in the Security Leasing Protocol
          </p>
        </div>
        <Link href="/validators/register" className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Register Validator
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search validators by address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {/* Validators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredValidators.map((validator) => (
          <div key={validator.address} className="card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-500/20 rounded-lg">
                  <Shield className="h-6 w-6 text-primary-400" />
                </div>
                <div>
                  <p className="font-mono text-sm text-gray-400">
                    {formatAddress(validator.address)}
                  </p>
                  <p className="text-xs text-gray-500">Reputation: {validator.reputation}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Stake</span>
                <span className="font-semibold">{formatNumber(validator.totalStake)} AVAX</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Available</span>
                <span className="font-semibold text-green-400">
                  {formatNumber(validator.availableStake)} AVAX
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Leased</span>
                <span className="font-semibold">{formatNumber(validator.leasedStake)} AVAX</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Active Leases</span>
                <span className="font-semibold">{validator.activeLeases}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Uptime</span>
                <span className="font-semibold text-green-400">{validator.uptime}%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dark-700">
              <Link
                href={`/validators/${validator.address}`}
                className="btn-secondary w-full text-center block"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredValidators.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400">No validators found</p>
        </div>
      )}
    </div>
  )
}