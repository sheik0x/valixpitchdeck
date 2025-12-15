'use client'

import { Rocket, CheckCircle } from 'lucide-react'

export default function DeploymentPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Rocket className="h-10 w-10 text-primary-400" />
          Deployment
        </h1>
        <p className="text-gray-400">
          Deployment guides and instructions
        </p>
      </div>

      <div className="card space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <span>Node.js 18+ installed</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <span>Hardhat configured</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <span>Access to RPC endpoint</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <span>Private keys for deployment</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Deployment Steps</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-300">
            <li>Install dependencies: <code className="bg-dark-700 px-2 py-1 rounded">npm install</code></li>
            <li>Configure environment variables</li>
            <li>Deploy contracts: <code className="bg-dark-700 px-2 py-1 rounded">npx hardhat run scripts/deploy.js</code></li>
            <li>Verify contracts on explorer</li>
            <li>Update frontend with contract addresses</li>
            <li>Deploy frontend to hosting service</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contract Deployment Order</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>SecurityLeasingRegistry</li>
            <li>SlashingEngine</li>
            <li>RewardDistributor</li>
            <li>HeterogeneousVerificationModule (HVM)</li>
            <li>AtomicCrossChainSlashing (ACCS)</li>
            <li>DynamicFeeMarket</li>
            <li>LeaseManager</li>
            <li>Governance</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Post-Deployment</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Verify all contracts on block explorer</li>
            <li>• Initialize governance with proper addresses</li>
            <li>• Set subnet adapters</li>
            <li>• Configure monitoring service</li>
            <li>• Test all functionality</li>
          </ul>
        </section>
      </div>
    </div>
  )
}