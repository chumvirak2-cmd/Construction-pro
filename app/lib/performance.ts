// Performance optimization utilities

/**
 * Debounce function to reduce rapid function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * Throttle function to limit function calls over time
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Cache management utility with expiration
 */
export class CacheManager {
  private cache: Map<string, { data: any; expiry: number }> = new Map()

  set(key: string, data: any, ttlSeconds: number = 300) {
    const expiry = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { data, expiry })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }
    return true
  }
}

// Global cache instance
export const globalCache = new CacheManager()

/**
 * Optimized localStorage operations with error handling
 */
export class StorageManager {
  static setItem<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Failed to set localStorage item: ${key}`, error)
      return false
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') return null
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn(`Failed to get localStorage item: ${key}`, error)
      return null
    }
  }

  static removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Failed to remove localStorage item: ${key}`, error)
      return false
    }
  }

  static clear(): boolean {
    try {
      if (typeof window === 'undefined') return false
      localStorage.clear()
      return true
    } catch (error) {
      console.warn('Failed to clear localStorage', error)
      return false
    }
  }
}

/**
 * Request deduplication to prevent multiple identical requests
 */
export class RequestDeduplicator {
  private pending: Map<string, Promise<any>> = new Map()

  async deduplicate<T>(
    key: string,
    request: () => Promise<T>
  ): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key)!
    }

    const promise = request().finally(() => {
      this.pending.delete(key)
    })

    this.pending.set(key, promise)
    return promise
  }

  clear() {
    this.pending.clear()
  }
}

export const globalDeduplicator = new RequestDeduplicator()

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  static markStart(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-start`)
    }
  }

  static markEnd(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-end`)
      try {
        window.performance.measure(name, `${name}-start`, `${name}-end`)
      } catch (error) {
        console.warn(`Performance measure failed for: ${name}`, error)
      }
    }
  }

  static getMetrics(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      const measures = window.performance.getEntriesByName(name, 'measure')
      if (measures.length > 0) {
        return measures[measures.length - 1].duration
      }
    }
    return null
  }

  static clearMarks(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.clearMarks(`${name}-start`)
      window.performance.clearMarks(`${name}-end`)
      window.performance.clearMeasures(name)
    }
  }
}

/**
 * Batch operation utility to group multiple operations
 */
export function batch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  return new Promise((resolve, reject) => {
    const results: R[] = []
    let processed = 0

    const processBatch = async (start: number) => {
      const end = Math.min(start + batchSize, items.length)

      try {
        const batchResults = await Promise.all(
          items.slice(start, end).map(processor)
        )
        results.push(...batchResults)
        processed += batchResults.length

        if (end < items.length) {
          // Use requestIdleCallback for next batch to avoid blocking UI
          if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            requestIdleCallback(() => processBatch(end))
          } else {
            setTimeout(() => processBatch(end), 0)
          }
        } else {
          resolve(results)
        }
      } catch (error) {
        reject(error)
      }
    }

    if (items.length === 0) {
      resolve(results)
    } else {
      processBatch(0)
    }
  })
}

/**
 * Lazy load images with intersection observer
 */
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  if (typeof window === 'undefined') return src

  const imageRef = (el: HTMLImageElement | null) => {
    if (!el) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = src
          img.style.opacity = '1'
          observer.unobserve(img)
        }
      })
    }, options)

    observer.observe(el)
  }

  return imageRef
}

/**
 * Optimize window scroll performance
 */
export function useOptimizedScroll(callback: (scrollY: number) => void, delay: number = 100) {
  if (typeof window === 'undefined') return

  let ticking = false

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        callback(window.scrollY)
        ticking = false
      })
      ticking = true
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true })

  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}
