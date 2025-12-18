'use client'

import { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-black w-full">
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
