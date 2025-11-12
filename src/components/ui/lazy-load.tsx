import { lazy, Suspense, ComponentType } from 'react'
import { LoadingSpinner } from './loading-spinner'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense
        fallback={
          fallback || (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner />
            </div>
          )
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Image optimization helper - using standard img tag for compatibility
export function OptimizedImage({
  src,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) {
    return null
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src as string}
      alt={alt || ''}
      loading="lazy"
      decoding="async"
      className={className}
      {...props}
    />
  )
}
