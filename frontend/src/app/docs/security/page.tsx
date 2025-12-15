'use client'

import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Shield className="h-10 w-10 text-primary-400" />
          Security
        </h1>
        <p className="text-gray-400">
          Security model and best practices
        </p>
      </div>

      <div className="card space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Security Model</h2>
          <p className="text-gray-300 mb-4">
            The Unified Security Layer uses a trustless, cryptographic approach to ensure security 
            across heterogeneous subnets without requiring trusted intermediaries.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Security Features</h2>
          <div className="space-y-4">
            <div className="p-4 bg-dark-700 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Trustless Slashing</h3>
                  <p className="text-sm text-gray-300">
                    ACCS enables trustless slashing using cryptographic proofs, eliminating the need 
                    for trusted bridges or intermediaries.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-dark-700 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Stake Escrow</h3>
                  <p className="text-sm text-gray-300">
                    Validator stake is held in escrow on the main chain, providing economic guarantees 
                    for subnet security.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-dark-700 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Proof Verification</h3>
                  <p className="text-sm text-gray-300">
                    HVM verifies state proofs cryptographically, ensuring only valid proofs trigger slashing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
          <div className="space-y-2 text-gray-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <p>Always verify contract addresses before interacting</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <p>Use hardware wallets for large stakes</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <p>Monitor your leases regularly</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <p>Keep validator nodes updated</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Audit Status</h2>
          <p className="text-gray-300">
            The protocol is ready for security audit. All contracts have been implemented with 
            security best practices in mind.
          </p>
        </section>
      </div>
    </div>
  )
}