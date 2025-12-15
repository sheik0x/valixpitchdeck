import Link from 'next/link'
import { Github, Twitter, Book } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-dark-700 mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Unified Security Layer</h3>
            <p className="text-gray-400 text-sm">
              Generalized, Economically Unified Security Layer for Heterogeneous Subnets
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/docs" className="hover:text-primary-400 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-primary-400 transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-primary-400 transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/sheik0x/unifiedsecuritylayer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="/docs"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Book className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-dark-700 text-center text-sm text-gray-500">
          <p>© 2024 Unified Security Layer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}