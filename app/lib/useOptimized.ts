import { useEffect, useState, useCallback, useRef } from 'react'
import { globalCache, globalDeduplicator, StorageManager } from './performance'

/**
 * Hook for optimized data loading with caching and deduplication
 */
export function useOptimizedData<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  options: {
    cacheTtl?: number
    useStorage?: boolean
    deduplicate?: boolean
  } = {}
) {
  const { cacheTtl = 300, useStorage = true, deduplicate = true } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const isMountedRef = useRef(true)

  const loadData = useCallback(async () => {
    // Check memory cache first
    if (globalCache.has(key)) {
      const cached = globalCache.get(key)
      if (isMountedRef.current) {
        setData(cached)
        setLoading(false)
      }
      return
    }

    // Check storage cache
    if (useStorage) {
      const stored = StorageManager.getItem<T>(key)
      if (stored) {
        if (isMountedRef.current) {
          setData(stored)
          globalCache.set(key, stored, cacheTtl)
          setLoading(false)
        }
        return
      }
    }

    try {
      setLoading(true)
      setError(null)

      let result: T

      if (deduplicate) {
        result = await globalDeduplicator.deduplicate(key, fetcher as () => Promise<T>)
      } else {
        const fetcherResult = fetcher()
        result = fetcherResult instanceof Promise ? await fetcherResult : fetcherResult
      }

      if (isMountedRef.current) {
        setData(result)
        globalCache.set(key, result, cacheTtl)
        if (useStorage) {
          StorageManager.setItem(key, result)
        }
        setLoading(false)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      }
    }
  }, [key, fetcher, cacheTtl, useStorage, deduplicate])

  useEffect(() => {
    isMountedRef.current = true
    loadData()

    return () => {
      isMountedRef.current = false
    }
  }, [loadData])

  const refetch = useCallback(() => {
    globalCache.delete(key)
    if (useStorage) {
      StorageManager.removeItem(key)
    }
    loadData()
  }, [key, loadData, useStorage])

  return { data, loading, error, refetch }
}

/**
 * Hook for debounced input with optimized rendering
 */
export function useDebouncedValue<T>(value: T, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observer.disconnect()
    }
  }, [options])

  return { ref, isVisible }
}

/**
 * Hook for managing async state with better performance
 */
export function useAsyncState<T>(
  initialValue: T
): [T, (value: T) => void, boolean] {
  const [state, setState] = useState<T>(initialValue)
  const [isUpdating, setIsUpdating] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const updateState = useCallback((value: T) => {
    setIsUpdating(true)
    Promise.resolve().then(() => {
      if (isMountedRef.current) {
        setState(value)
        setIsUpdating(false)
      }
    })
  }, [])

  return [state, updateState, isUpdating]
}

/**
 * Hook for memoized callbacks that update rarely
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback((...args: any[]) => {
    return callbackRef.current(...args)
  }, []) as T
}

/**
 * Hook for managing visibility with requestAnimationFrame
 */
export function useAnimationFrameValue(value: any, updateRate: number = 60) {
  const [animatedValue, setAnimatedValue] = useState(value)
  const frameIdRef = useRef<number | null>(null)

  useEffect(() => {
    let lastUpdate = Date.now()

    const animate = () => {
      const now = Date.now()
      if (now - lastUpdate >= 1000 / updateRate) {
        setAnimatedValue(value)
        lastUpdate = now
      }
      frameIdRef.current = requestAnimationFrame(animate)
    }

    frameIdRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current)
      }
    }
  }, [value, updateRate])

  return animatedValue
}
