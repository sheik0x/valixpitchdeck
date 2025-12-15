'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Fee Market', href: '/fee-market' },
  { name: 'Validators', href: '/validators' },
  { name: 'ACCS Monitor', href: '/accs' },
  { name: 'Governance', href: '/governance' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary-500" />
              <span className="text-xl font-bold text-gradient">USL</span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ConnectButton showBalance={false} />
            
            <button
              className="md:hidden p-2 text-gray-400 hover:text-gray-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        )}
      </nav>
    </header>
  )
}