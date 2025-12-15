'use client'

export default function ArchitecturePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Architecture</h1>
        <p className="text-gray-400">
          System architecture and design patterns
        </p>
      </div>

      <div className="card space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-gray-300 mb-4">
            The Unified Security Layer consists of smart contracts on the main chain that coordinate 
            security leasing to heterogeneous subnets through standardized adapters.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Core Components</h2>
          <div className="space-y-4">
            <div className="p-4 bg-dark-700 rounded-lg">
              <h3 className="font-semibold text-primary-400 mb-2">SecurityLeasingRegistry</h3>
              <p className="text-gray-300 text-sm">
                Central registry managing validators, subnets, and leases
              </p>
            </div>
            <div className="p-4 bg-dark-700 rounded-lg">
              <h3 className="font-semibold text-primary-400 mb-2">AtomicCrossChainSlashing (ACCS)</h3>
              <p className="text-gray-300 text-sm">
                Trustless cross-chain slashing using cryptographic proofs
              </p>
            </div>
            <div className="p-4 bg-dark-700 rounded-lg">
              <h3 className="font-semibold text-primary-400 mb-2">HeterogeneousVerificationModule (HVM)</h3>
              <p className="text-gray-300 text-sm">
                Standardized interface for multi-VM state proof verification
              </p>
            </div>
            <div className="p-4 bg-dark-700 rounded-lg">
              <h3 className="font-semibold text-primary-400 mb-2">DynamicFeeMarket</h3>
              <p className="text-gray-300 text-sm">
                Market-driven matching of security bids and offers
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Protocol Flow</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Validators register on main chain with stake</li>
            <li>Subnets register with security requirements</li>
            <li>Fee market matches bids and offers</li>
            <li>Validators lock stake in ACCS</li>
            <li>Validators registered on subnet via adapter</li>
            <li>HVM verifies state proofs</li>
            <li>ACCS executes slashing if needed</li>
            <li>Validators earn fees in subnet tokens</li>
          </ol>
        </section>
      </div>
    </div>
  )
}