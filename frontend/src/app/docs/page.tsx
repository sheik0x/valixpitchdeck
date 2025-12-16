'use client'

import { Book, FileText, Code, Shield, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const docs = [
  {
    title: 'Getting Started',
    description: 'Quick start guide for the Unified Security Layer',
    icon: Zap,
    href: '/docs/getting-started',
  },
  {
    title: 'Architecture',
    description: 'System architecture and design patterns',
    icon: Code,
    href: '/docs/architecture',
  },
  {
    title: 'Groundbreaking Features',
    description: 'ACCS, HVM, and Dynamic Fee Market',
    icon: TrendingUp,
    href: '/docs/features',
  },
  {
    title: 'Security',
    description: 'Security model and best practices',
    icon: Shield,
    href: '/docs/security',
  },
  {
    title: 'API Reference',
    description: 'Complete API documentation',
    icon: FileText,
    href: '/docs/api',
  },
  {
    title: 'Deployment',
    description: 'Deployment guides and instructions',
    icon: Book,
    href: '/docs/deployment',
  },
]

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Book className="h-10 w-10 text-primary-400" />
          Documentation
        </h1>
        <p className="text-gray-400">
          Complete documentation for the Unified Security Layer protocol
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((doc) => {
          const Icon = doc.icon
          return (
            <Link
              key={doc.title}
              href={doc.href}
              className="card-hover p-6 group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-500/20 rounded-lg group-hover:bg-primary-500/30 transition-colors">
                  <Icon className="h-6 w-6 text-primary-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{doc.title}</h3>
                  <p className="text-sm text-gray-400">{doc.description}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="space-y-2">
          <Link href="/docs/getting-started" className="block text-primary-400 hover:text-primary-300">
            → Getting Started Guide
          </Link>
          <Link href="/docs/architecture" className="block text-primary-400 hover:text-primary-300">
            → Architecture Overview
          </Link>
          <Link href="/docs/features" className="block text-primary-400 hover:text-primary-300">
            → Groundbreaking Features
          </Link>
          <Link href="/docs/security" className="block text-primary-400 hover:text-primary-300">
            → Security Model
          </Link>
        </div>
      </div>
    </div>
  )
}



