'use client'

import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          <div className="flex min-h-screen flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
