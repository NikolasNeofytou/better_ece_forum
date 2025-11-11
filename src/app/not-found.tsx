import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible-ring"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go Home
          </Link>
          
          <Link
            href="/posts"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors focus-visible-ring"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Browse Posts
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Go Back
        </button>
      </div>
    </div>
  )
}
