import React, { lazy, Suspense } from 'react'

/**
 * Loading skeleton component for better perceived performance
 */
export function LoadingSkeleton({
  width = '100%',
  height = '20px',
  count = 1,
  style = {}
}: {
  width?: string | number
  height?: string | number
  count?: number
  style?: React.CSSProperties
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width,
            height,
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            marginBottom: '8px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            ...style,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}

/**
 * Lazy loading wrapper for components
 */
export function LazyComponent({
  component: Component,
  fallback = <LoadingSkeleton count={3} />,
}: {
  component: React.ComponentType<any>
  fallback?: React.ReactNode
}) {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  )
}

/**
 * Image component with lazy loading and optimization
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  quality?: number
}) {
  const [isLoading, setIsLoading] = React.useState(true)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full object-cover"
      />
    </div>
  )
}

/**
 * Virtual list component for rendering large lists efficiently
 */
export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  containerHeight = 400,
  overscan = 5,
}: {
  items: T[]
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  containerHeight?: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => {
        const target = e.target as HTMLDivElement
        setScrollTop(target.scrollTop)
      }}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Pagination component for data splitting
 */
export function usePagination<T>(items: T[], pageSize: number = 10) {
  const [currentPage, setCurrentPage] = React.useState(1)

  const totalPages = Math.ceil(items.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedItems = items.slice(startIndex, endIndex)

  return {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage: (page: number) => {
      setCurrentPage(Math.min(Math.max(1, page), totalPages))
    },
    nextPage: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setCurrentPage((p) => Math.max(p - 1, 1)),
  }
}

/**
 * Intersection observer wrapper for lazy loading sections
 */
export function LazySection({
  children,
  onVisible,
  fallback = <LoadingSkeleton count={3} />,
}: {
  children: React.ReactNode
  onVisible?: () => void
  fallback?: React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            onVisible?.()
            observer.unobserve(ref.current!)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [onVisible])

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  )
}
