'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary-500">404</h1>
          <h2 className="text-3xl font-bold">Page Not Found</h2>
          <p className="text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary flex items-center justify-center gap-2">
            <Home className="h-5 w-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-dark-700">
          <p className="text-sm text-gray-500 mb-4">Popular Pages:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/" className="text-primary-400 hover:text-primary-300 text-sm">
              Dashboard
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/fee-market" className="text-primary-400 hover:text-primary-300 text-sm">
              Fee Market
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/validators" className="text-primary-400 hover:text-primary-300 text-sm">
              Validators
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/docs" className="text-primary-400 hover:text-primary-300 text-sm">
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}