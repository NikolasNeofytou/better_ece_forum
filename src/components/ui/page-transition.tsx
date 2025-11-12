import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Mark as transitioning when pathname changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTransitioning(true)
    
    // Clear transition after animation completes
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [pathname])

  return isTransitioning
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const isTransitioning = usePageTransition()

  return (
    <div
      className={`transition-opacity duration-300 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  )
}
