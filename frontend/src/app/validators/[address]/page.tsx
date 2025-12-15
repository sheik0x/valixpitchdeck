'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Shield, TrendingUp, Clock, AlertTriangle } from 'lucide-react'
import { formatAddress, formatNumber, formatDate } from '@/lib/utils'
import Link from 'next/link'

// Mock data - replace with real API call
const getValidatorDetails = async (address: string) => {
  // In production, fetch from API
  return {
    address,
    totalStake: 100000,
    availableStake: 50000,
    leasedStake: 50000,
    activeLeases: 5,
    uptime: 99.8,
    reputation: 95,
    registrationTime: Date.now() - 86400000 * 30,
    leases: [
      { id: '1', subnet: 'Avalanche Subnet A', stake: 10000, status: 'Active', startTime: Date.now() - 86400000 * 10 },
      { id: '2', subnet: 'Cosmos Chain B', stake: 5000, status: 'Active', startTime: Date.now() - 86400000 * 5 },
    ],
    rewards: {
      totalEarned: 1250,
      pending: 125,
      lastClaimed: Date.now() - 86400000,
    },
  }
}

export default function ValidatorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const address = params.address as string

  const { data: validator, isLoading } = useQuery({
    queryKey: ['validator', address],
    queryFn: () => getValidatorDetails(address),
    enabled: !!address,
  })

  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-400">Loading validator details...</p>
      </div>
    )
  }

  if (!validator) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-400 mb-4">Validator not found</p>
        <Link href="/validators" className="btn-primary">
          Back to Validators
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-4xl font-bold mb-2">Validator Details</h1>
          <p className="text-gray-400 font-mono">{formatAddress(validator.address, 8)}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Stake</p>
              <p className="text-2xl font-bold">{formatNumber(validator.totalStake)} AVAX</p>
            </div>
            <Shield className="h-8 w-8 text-primary-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Available</p>
              <p className="text-2xl font-bold text-green-400">
                {formatNumber(validator.availableStake)} AVAX
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Leases</p>
              <p className="text-2xl font-bold">{validator.activeLeases}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Uptime</p>
              <p className="text-2xl font-bold text-green-400">{validator.uptime}%</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Active Leases */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Active Leases</h2>
        <div className="space-y-4">
          {validator.leases.map((lease) => (
            <div
              key={lease.id}
              className="p-4 bg-dark-700 rounded-lg border border-dark-600"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">{lease.subnet}</h3>
                  <p className="text-sm text-gray-400">
                    Stake: {formatNumber(lease.stake)} AVAX
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Started: {formatDate(lease.startTime)}
                  </p>
                </div>
                <span className="badge badge-success">{lease.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Earned</p>
            <p className="text-2xl font-bold">{formatNumber(validator.rewards.totalEarned)} AVAX</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">
              {formatNumber(validator.rewards.pending)} AVAX
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Last Claimed</p>
            <p className="text-sm font-medium">{formatDate(validator.rewards.lastClaimed)}</p>
          </div>
        </div>
        <button className="btn-primary mt-4 w-full">Claim Rewards</button>
      </div>
    </div>
  )
}