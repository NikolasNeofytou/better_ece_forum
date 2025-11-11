import { lazy, Suspense, ComponentType } from 'react'
import { LoadingSpinner } from './loading-spinner'

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

// Image optimization helper
export function OptimizedImage({
  src,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      {...props}
    />
  )
}
