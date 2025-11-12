'use client'

import Link from 'next/link'
import { WifiOff, Home, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center space-y-6 max-w-md animate-fade-in">
        <div className="flex justify-center">
          <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full">
            <WifiOff className="w-16 h-16 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            You&apos;re Offline
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            It looks like you&apos;ve lost your internet connection. Some features may be limited until you&apos;re back online.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go Home
          </Link>
        </div>

        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            💡 Tip: Some pages you&apos;ve visited recently may still be available offline.
          </p>
        </div>
      </div>
    </div>
  )
}
