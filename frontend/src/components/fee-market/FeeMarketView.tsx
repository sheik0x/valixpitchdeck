'use client'

import { useQuery } from '@tanstack/react-query'
import { Search, Filter } from 'lucide-react'
import { useState } from 'react'
import { formatNumber, formatAddress } from '@/lib/utils'

// Mock data
const mockBids = [
  {
    id: '1',
    subnet: 'Avalanche Subnet A',
    requiredStake: 10000,
    duration: 30,
    price: 0.05,
    qos: { uptime: 99.5, latency: 100, validators: 10 },
    status: 'Active',
  },
  {
    id: '2',
    subnet: 'Cosmos Chain B',
    requiredStake: 5000,
    duration: 60,
    price: 0.08,
    qos: { uptime: 99.9, latency: 50, validators: 15 },
    status: 'Active',
  },
]

const mockOffers = [
  {
    id: '1',
    validator: '0x1234...5678',
    availableStake: 20000,
    minPrice: 0.04,
    maxDuration: 90,
    qos: { uptime: 99.8, latency: 80 },
    status: 'Active',
  },
]

export function FeeMarketView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'bids' | 'offers'>('all')

  const { data: bids } = useQuery({
    queryKey: ['fee-market-bids'],
    queryFn: async () => mockBids,
  })

  const { data: offers } = useQuery({
    queryKey: ['fee-market-offers'],
    queryFn: async () => mockOffers,
  })

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search subnets, validators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`btn-secondary ${filter === 'all' ? 'bg-primary-600' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('bids')}
            className={`btn-secondary ${filter === 'bids' ? 'bg-primary-600' : ''}`}
          >
            Bids
          </button>
          <button
            onClick={() => setFilter('offers')}
            className={`btn-secondary ${filter === 'offers' ? 'bg-primary-600' : ''}`}
          >
            Offers
          </button>
        </div>
      </div>

      {/* Bids */}
      {(filter === 'all' || filter === 'bids') && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Active Bids</h2>
          <div className="space-y-4">
            {(bids || []).map((bid) => (
              <div
                key={bid.id}
                className="p-4 bg-dark-700 rounded-lg border border-dark-600 hover:border-primary-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{bid.subnet}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Required Stake</p>
                        <p className="font-medium">{formatNumber(bid.requiredStake)} AVAX</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Duration</p>
                        <p className="font-medium">{bid.duration} days</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Price</p>
                        <p className="font-medium">{bid.price} AVAX/sec</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Uptime</p>
                        <p className="font-medium">{bid.qos.uptime}%</p>
                      </div>
                    </div>
                  </div>
                  <button className="btn-primary ml-4">Match</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offers */}
      {(filter === 'all' || filter === 'offers') && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Validator Offers</h2>
          <div className="space-y-4">
            {(offers || []).map((offer) => (
              <div
                key={offer.id}
                className="p-4 bg-dark-700 rounded-lg border border-dark-600 hover:border-primary-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Validator {formatAddress(offer.validator)}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Available Stake</p>
                        <p className="font-medium">{formatNumber(offer.availableStake)} AVAX</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Min Price</p>
                        <p className="font-medium">{offer.minPrice} AVAX/sec</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Max Duration</p>
                        <p className="font-medium">{offer.maxDuration} days</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Uptime</p>
                        <p className="font-medium">{offer.qos.uptime}%</p>
                      </div>
                    </div>
                  </div>
                  <button className="btn-primary ml-4">Match</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}