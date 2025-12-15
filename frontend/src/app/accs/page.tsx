'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react'
import { formatAddress, formatDate } from '@/lib/utils'

// Mock data
const mockProofs = [
  {
    id: '1',
    leaseId: '0xabc...123',
    validator: '0x1234...5678',
    maliceType: 'DoubleSign',
    blockHash: '0xdef...456',
    timestamp: Date.now() - 3600000,
    verified: true,
    slashed: true,
  },
  {
    id: '2',
    leaseId: '0xdef...456',
    validator: '0xabcd...efgh',
    maliceType: 'InvalidStateTransition',
    blockHash: '0xghi...789',
    timestamp: Date.now() - 7200000,
    verified: false,
    slashed: false,
  },
]

export default function ACCSPage() {
  const { data: proofs } = useQuery({
    queryKey: ['accs-proofs'],
    queryFn: async () => mockProofs,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Atomic Cross-Chain Slashing (ACCS)</h1>
        <p className="text-gray-400">
          Monitor trustless cross-chain slashing events and proof-of-malice submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Proofs</p>
              <p className="text-2xl font-bold">{(proofs || []).length}</p>
            </div>
            <Shield className="h-8 w-8 text-primary-400" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Verified</p>
              <p className="text-2xl font-bold text-green-400">
                {(proofs || []).filter(p => p.verified).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Slashed</p>
              <p className="text-2xl font-bold text-red-400">
                {(proofs || []).filter(p => p.slashed).length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">
                {(proofs || []).filter(p => !p.verified).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Proofs Table */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Proof of Malice Events</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Proof ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Lease</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Validator</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {(proofs || []).map((proof) => (
                <tr key={proof.id} className="border-b border-dark-700/50 hover:bg-dark-700/30">
                  <td className="py-3 px-4 font-mono text-sm">{proof.id}</td>
                  <td className="py-3 px-4 font-mono text-sm">{formatAddress(proof.leaseId)}</td>
                  <td className="py-3 px-4 font-mono text-sm">{formatAddress(proof.validator)}</td>
                  <td className="py-3 px-4">
                    <span className="badge badge-warning">{proof.maliceType}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {formatDate(proof.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    {proof.verified ? (
                      <span className="badge badge-success">Verified</span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                    {proof.slashed && (
                      <span className="badge badge-danger ml-2">Slashed</span>
                    )}
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