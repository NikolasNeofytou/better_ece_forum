import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <Loader2 
      className={cn("animate-spin text-primary", sizeClasses[size], className)} 
      aria-label="Loading"
    />
  )
}

export function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status">
      <LoadingSpinner size="lg" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
