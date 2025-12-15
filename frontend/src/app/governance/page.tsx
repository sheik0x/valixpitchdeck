'use client'

import { useQuery } from '@tanstack/react-query'
import { Vote, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

// Mock data
const mockProposals = [
  {
    id: 1,
    title: 'Increase Minimum Validator Stake',
    description: 'Proposal to increase minimum validator stake from 1000 to 2000 AVAX',
    proposer: '0x1234...5678',
    startTime: Date.now() - 86400000,
    endTime: Date.now() + 172800000,
    forVotes: 1500000,
    againstVotes: 500000,
    status: 'Active',
  },
  {
    id: 2,
    title: 'Update Slashing Parameters',
    description: 'Adjust slashing percentages for different violation types',
    proposer: '0xabcd...efgh',
    startTime: Date.now() - 259200000,
    endTime: Date.now() - 86400000,
    forVotes: 2000000,
    againstVotes: 300000,
    status: 'Succeeded',
  },
]

export default function GovernancePage() {
  const { data: proposals } = useQuery({
    queryKey: ['governance-proposals'],
    queryFn: async () => mockProposals,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Governance</h1>
        <p className="text-gray-400">
          Participate in protocol governance and vote on proposals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Proposals</p>
              <p className="text-2xl font-bold">
                {(proposals || []).filter(p => p.status === 'Active').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Proposals</p>
              <p className="text-2xl font-bold">{(proposals || []).length}</p>
            </div>
            <Vote className="h-8 w-8 text-primary-400" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Your Voting Power</p>
              <p className="text-2xl font-bold">1,000</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Proposals */}
      <div className="space-y-4">
        {(proposals || []).map((proposal) => (
          <div key={proposal.id} className="card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{proposal.title}</h3>
                  <span className={`badge ${
                    proposal.status === 'Active' ? 'badge-info' :
                    proposal.status === 'Succeeded' ? 'badge-success' : 'badge-warning'
                  }`}>
                    {proposal.status}
                  </span>
                </div>
                <p className="text-gray-400 mb-4">{proposal.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Proposer: {proposal.proposer}</span>
                  <span>Ends: {formatDate(proposal.endTime)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">For</span>
                    <span className="text-sm font-semibold">
                      {((proposal.forVotes / (proposal.forVotes + proposal.againstVotes)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(proposal.forVotes / (proposal.forVotes + proposal.againstVotes)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Against</span>
                    <span className="text-sm font-semibold">
                      {((proposal.againstVotes / (proposal.forVotes + proposal.againstVotes)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${(proposal.againstVotes / (proposal.forVotes + proposal.againstVotes)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {proposal.status === 'Active' && (
              <div className="mt-4 flex gap-2">
                <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Vote For
                </button>
                <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Vote Against
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}