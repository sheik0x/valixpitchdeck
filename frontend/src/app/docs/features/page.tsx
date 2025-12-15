'use client'

import { Shield, Code, TrendingUp } from 'lucide-react'

export default function FeaturesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Groundbreaking Features</h1>
        <p className="text-gray-400">
          Three revolutionary innovations that make this protocol unique
        </p>
      </div>

      <div className="space-y-6">
        <div className="card">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <Shield className="h-6 w-6 text-primary-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2">Atomic Cross-Chain Slashing (ACCS)</h2>
              <p className="text-gray-300 mb-4">
                Trustless Economic Guarantee - Subnet security backed by main chain value without 
                trusted intermediaries. Validators lock stake on main chain; cryptographically 
                verifiable proof-of-malice triggers immediate, trustless slashing.
              </p>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• No trusted bridge needed</li>
                <li>• Cryptographic proof verification</li>
                <li>• Immediate atomic slashing</li>
                <li>• Supports multiple malice types</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Code className="h-6 w-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2">Heterogeneous Verification Module (HVM)</h2>
              <p className="text-gray-300 mb-4">
                Generalized Interoperability - Standardized interface supporting EVM, Move VM, 
                Cosmos SDK, Substrate, and custom VMs. Light-client-verified state proofs enable 
                true heterogeneous chain support.
              </p>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Supports any VM type</li>
                <li>• Standardized interface</li>
                <li>• Light client proofs</li>
                <li>• Easy to extend</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2">Dynamic Fee Market</h2>
              <p className="text-gray-300 mb-4">
                Sustainable Economic Model - Market where subnets bid for QoS-based security. 
                Creates continuous revenue stream for validators, paid in subnet native tokens. 
                Aligns financial incentives with ecosystem security.
              </p>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Market-driven pricing</li>
                <li>• QoS-based matching</li>
                <li>• Multi-token support</li>
                <li>• Automatic matching</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}