# Performance Optimization Guide

## Overview
This document outlines the performance optimizations implemented in the Construction Pro application and best practices for maintaining and improving performance.

## Implemented Optimizations

### 1. **Image Optimization**
- ✅ Enabled Next.js Image Optimization
- ✅ Added AVIF and WebP format support for modern browsers
- ✅ Automatic responsive image sizing
- ✅ Lazy loading by default

**Usage:**
```tsx
import { OptimizedImage } from '@/components/OptimizedComponents'

<OptimizedImage 
  src="/image.jpg" 
  alt="Description"
  width={400}
  height={300}
/>
```

### 2. **Caching Strategy**
- ✅ Memory cache with TTL (Time-To-Live)
- ✅ LocalStorage persistence
- ✅ Request deduplication to prevent duplicate API calls
- ✅ HTTP cache headers for static assets (1 year) and API responses (5 minutes)

**Usage:**
```tsx
import { useOptimizedData } from '@/lib/useOptimized'

const { data, loading, error, refetch } = useOptimizedData(
  'cache-key',
  async () => {
    // Your data fetching logic
    return data
  },
  { cacheTtl: 300, useStorage: true }
)
```

### 3. **Code Splitting & Lazy Loading**
- ✅ Component lazy loading with Suspense boundaries
- ✅ Route-based code splitting (Next.js default)
- ✅ Lazy section loading for below-the-fold content
- ✅ Virtual list for rendering large datasets

**Usage:**
```tsx
import { LazyComponent, LazySection } from '@/components/OptimizedComponents'

// Lazy load a component
<LazyComponent component={HeavyComponent} />

// Lazy load a section
<LazySection onVisible={() => console.log('Section visible')}>
  <ExpensiveContent />
</LazySection>
```

### 4. **Data Loading Optimization**
- ✅ Request deduplication prevents multiple identical requests
- ✅ Batching for processing large datasets
- ✅ Debouncing for search and filter operations
- ✅ Async state management without blocking UI

**Usage:**
```tsx
import { useDebouncedValue } from '@/lib/useOptimized'
import { batch } from '@/lib/performance'

// Debounced search input
const debouncedSearchTerm = useDebouncedValue(searchTerm, 500)

// Batch process items
const results = await batch(largeDataset, processor, 10)
```

### 5. **Middleware & Security Headers**
- ✅ Content Security Policy headers
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection enabled
- ✅ Gzip compression enabled

### 6. **Font Optimization**
- ✅ Google Fonts with system fallbacks
- ✅ Font subsetting (Latin only, configurable)
- ✅ Font display strategy: `swap` for immediate text rendering

### 7. **Performance Monitoring**
- ✅ Built-in performance markers and measurements
- ✅ Monitor page load times
- ✅ Track specific operation durations

**Usage:**
```tsx
import { PerformanceMonitor } from '@/lib/performance'

PerformanceMonitor.markStart('operation-name')
// ... do work ...
PerformanceMonitor.markEnd('operation-name')
const duration = PerformanceMonitor.getMetrics('operation-name')
console.log(`Operation took ${duration}ms`)
```

## Best Practices

### 1. **Component Optimization**
- Use React.memo for components with same props
- Split large components into smaller ones
- Use dynamic imports for heavy components
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <LoadingSkeleton />,
})
```

### 2. **Data Fetching**
- Always use `useOptimizedData` hook for fetching
- Enable caching for stable data (cacheTtl > 0)
- Use localStorage for session-persistent data
- Deduplicate identical requests automatically

### 3. **List Rendering**
- Use `VirtualList` for lists with 100+ items
- Use pagination for better UX
- Enable virtual scrolling for large tables

```tsx
import { VirtualList, usePagination } from '@/components/OptimizedComponents'

// For large lists
<VirtualList items={items} itemHeight={50} renderItem={renderRow} />

// For pagination
const { paginatedItems, currentPage, goToPage } = usePagination(items, 20)
```

### 4. **Image Handling**
- Always use OptimizedImage component
- Set proper width/height for layout stability
- Use priority={true} for above-the-fold images only
- Compress images before uploading (recommended < 500KB)

### 5. **Event Handling**
- Use debounce for search/filter inputs (500ms)
- Use throttle for scroll events (100ms)
- Mark event listeners as passive: `{ passive: true }`

```tsx
import { debounce, throttle } from '@/lib/performance'

const handleSearch = debounce((value) => {
  // Search logic
}, 500)

const handleScroll = throttle(() => {
  // Scroll logic
}, 100)
```

### 6. **Bundle Size**
- Check bundle size: `npm run build`
- Avoid importing entire libraries, use tree-shaking
- Lazy load heavy libraries (xlsx, jspdf, etc.)
- Remove unused dependencies regularly

### 7. **Caching Patterns**

**User Data (10-15 mins):**
```tsx
useOptimizedData('user-data', fetchUserData, { cacheTtl: 600 })
```

**Dashboard Stats (5 mins):**
```tsx
useOptimizedData('dashboard-stats', fetchStats, { cacheTtl: 300 })
```

**Master Data (1 hour):**
```tsx
useOptimizedData('categories', fetchCategories, { cacheTtl: 3600 })
```

**Session Data (Until page close):**
```tsx
useOptimizedData('session-state', fetchSessionState, { useStorage: false })
```

## Performance Metrics to Monitor

### Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Custom Metrics
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- API response time
- Bundle size

### Tools
- Chrome DevTools (Lighthouse, Performance tab)
- WebPageTest.org
- Google PageSpeed Insights
- Vercel Analytics (if deployed)

## Configuration Files Modified

1. **next.config.js** - Image optimization, caching headers, compression
2. **middleware.ts** - Security headers, performance headers
3. **app/layout.tsx** - Viewport and metadata optimization

## New Utilities & Hooks

| File | Purpose |
|------|---------|
| `/lib/performance.ts` | Core performance utilities |
| `/lib/useOptimized.ts` | React hooks for optimized data loading |
| `/components/OptimizedComponents.tsx` | Reusable optimized components |

## Performance Checklist

- [ ] Enable image optimization (✅ Done)
- [ ] Implement caching strategy (✅ Done)
- [ ] Lazy load components (✅ Utilities provided)
- [ ] Optimize fonts (✅ Done)
- [ ] Add monitoring (✅ Done)
- [ ] Remove unused dependencies
- [ ] Enable compression (✅ Done)
- [ ] Set cache headers (✅ Done)
- [ ] Implement pagination for large lists (✅ Utils provided)
- [ ] Test with Chrome DevTools

## Next Steps

1. **Audit existing pages:**
   - Replace old data fetching with `useOptimizedData`
   - Add lazy loading to large components
   - Implement pagination where needed

2. **Update dashboard:**
   - Use `useOptimizedData` for stats fetching
   - Implement lazy loading for sections
   - Add performance monitoring

3. **Test and measure:**
   - Run Lighthouse audit
   - Monitor Core Web Vitals
   - Check bundle size
   - Test on slow 3G connection

4. **Ongoing optimization:**
   - Monitor performance metrics
   - Update cache TTLs based on data change frequency
   - Add new optimizations as needed

## Resources

- [Next.js Performance Guide](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/reference/react/useMemo)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
