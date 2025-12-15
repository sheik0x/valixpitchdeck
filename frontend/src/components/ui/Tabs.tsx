'use client'

import { useState, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export function Tabs({ 
  value, 
  onValueChange, 
  children 
}: { 
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode 
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn('flex space-x-1 bg-dark-800 p-1 rounded-lg border border-dark-700', className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ 
  value, 
  children 
}: { 
  value: string
  children: React.ReactNode 
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')
  
  const isActive = context.value === value
  
  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={cn(
        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ 
  value, 
  children 
}: { 
  value: string
  children: React.ReactNode 
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')
  
  if (context.value !== value) return null
  
  return <div className="mt-6">{children}</div>
}