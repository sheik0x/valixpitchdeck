'use client'

import Link from 'next/link'

export default function GettingStartedPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Getting Started</h1>
        <p className="text-gray-400">
          Quick start guide for the Unified Security Layer
        </p>
      </div>

      <div className="card space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">What is Unified Security Layer?</h2>
          <p className="text-gray-300 mb-4">
            The Unified Security Layer is a groundbreaking protocol that enables main chain validators 
            to lease their security stake to subnets in a trust-minimized way, solving the Security 
            Fragmentation and Cold Start Problem.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• <strong>Atomic Cross-Chain Slashing (ACCS)</strong> - Trustless slashing without intermediaries</li>
            <li>• <strong>Heterogeneous Verification Module (HVM)</strong> - Support for any VM type</li>
            <li>• <strong>Dynamic Fee Market</strong> - Market-driven security pricing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
          <div className="space-y-4">
            <div className="p-4 bg-dark-700 rounded-lg">
              <h3 className="font-semibold mb-2">For Validators</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Connect your wallet</li>
                <li><Link href="/validators/register" className="text-primary-400 hover:underline">Register as a validator</Link></li>
                <li>Create offers in the <Link href="/fee-market" className="text-primary-400 hover:underline">Fee Market</Link></li>
                <li>Start earning fees from security leasing</li>
              </ol>
            </div>

            <div className="p-4 bg-dark-700 rounded-lg">
              <h3 className="font-semibold mb-2">For Subnets</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Register your subnet</li>
                <li>Create a security bid in the <Link href="/fee-market" className="text-primary-400 hover:underline">Fee Market</Link></li>
                <li>Specify QoS requirements</li>
                <li>Get matched with validators automatically</li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
          <div className="flex gap-4">
            <Link href="/docs/architecture" className="btn-primary">
              Read Architecture Docs
            </Link>
            <Link href="/docs/features" className="btn-secondary">
              Learn About Features
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}