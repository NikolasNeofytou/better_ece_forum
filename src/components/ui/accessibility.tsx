import { useEffect, useRef } from 'react'

export function useAccessibleFocus() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.focus()
    }
  }, [])

  return ref
}

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:top-0 focus:left-0"
    >
      Skip to main content
    </a>
  )
}

export function AccessibleButton({
  children,
  ariaLabel,
  ariaDescription,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ariaLabel?: string
  ariaDescription?: string
}) {
  return (
    <button
      aria-label={ariaLabel}
      aria-describedby={ariaDescription}
      {...props}
    >
      {children}
    </button>
  )
}
