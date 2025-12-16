'use client'

import { Code, FileText } from 'lucide-react'

export default function APIPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Code className="h-10 w-10 text-primary-400" />
          API Reference
        </h1>
        <p className="text-gray-400">
          Complete API documentation for smart contracts
        </p>
      </div>

      <div className="card space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Smart Contract APIs</h2>
          <p className="text-gray-300 mb-4">
            All contracts follow standard Solidity patterns and are compatible with standard 
            Ethereum tooling.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">SecurityLeasingRegistry</h3>
          <div className="space-y-2 text-sm font-mono text-gray-300 bg-dark-700 p-4 rounded-lg">
            <div>function registerValidator(...)</div>
            <div>function registerSubnet(...)</div>
            <div>function createLease(...)</div>
            <div>function activateLease(...)</div>
            <div>function expireLease(...)</div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">AtomicCrossChainSlashing</h3>
          <div className="space-y-2 text-sm font-mono text-gray-300 bg-dark-700 p-4 rounded-lg">
            <div>function lockStake(...)</div>
            <div>function submitProofOfMalice(...)</div>
            <div>function verifyProof(...)</div>
            <div>function unlockStake(...)</div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">DynamicFeeMarket</h3>
          <div className="space-y-2 text-sm font-mono text-gray-300 bg-dark-700 p-4 rounded-lg">
            <div>function createSecurityBid(...)</div>
            <div>function createValidatorOffer(...)</div>
            <div>function getBid(...)</div>
            <div>function getOffer(...)</div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">HeterogeneousVerificationModule</h3>
          <div className="space-y-2 text-sm font-mono text-gray-300 bg-dark-700 p-4 rounded-lg">
            <div>function registerVerifier(...)</div>
            <div>function submitStateProof(...)</div>
            <div>function verifyStateProof(...)</div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Integration</h2>
          <p className="text-gray-300 mb-4">
            Use standard Web3 libraries like ethers.js, viem, or web3.js to interact with the contracts.
          </p>
          <div className="p-4 bg-dark-700 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Example with ethers.js:</p>
            <pre className="text-xs text-gray-300 overflow-x-auto">
{`const registry = new ethers.Contract(
  registryAddress,
  abi,
  signer
);

await registry.registerValidator(
  totalStake,
  availableStake,
  subnetTypes,
  minDuration,
  maxDuration
);`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  )
}



