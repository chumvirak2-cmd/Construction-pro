# Performance Optimization - Quick Reference Card

## 🎯 One-Minute Tips

### Data Loading
```tsx
import { useOptimizedData } from '@/lib/useOptimized'

// ✅ DO THIS
const { data } = useOptimizedData('cache-key', fetchFunction, { cacheTtl: 300 })

// ❌ DON'T DO THIS
const [data, setData] = useState(null)
useEffect(() => { /* fetch manually */ }, [])
```

### Lists & Tables
```tsx
// ✅ 100+ items: Use VirtualList
<VirtualList items={items} itemHeight={50} renderItem={renderItem} />

// ✅ Smaller lists: Use pagination
const { paginatedItems, goToPage } = usePagination(items, 20)

// ❌ DON'T: Render all items at once
{items.map(item => <Item key={item.id} {...item} />)}
```

### Images
```tsx
// ✅ DO THIS
import { OptimizedImage } from '@/components/OptimizedComponents'
<OptimizedImage src="..." alt="..." width={400} height={300} />

// ❌ DON'T DO THIS
<img src="..." alt="..." />
```

### Search/Filter Input
```tsx
// ✅ DO THIS - Debounce expensive operations
const debouncedSearch = useDebouncedValue(searchTerm, 500)
useEffect(() => {
  if (debouncedSearch) {
    performSearch()
  }
}, [debouncedSearch])

// ❌ DON'T DO THIS - Triggers on every keystroke
const handleChange = (e) => {
  setSearchTerm(e.target.value)
  performSearch()
}
```

### Heavy Components
```tsx
// ✅ DO THIS - Lazy load
import dynamic from 'next/dynamic'
const HeavyChart = dynamic(() => import('./Chart'), {
  loading: () => <LoadingSkeleton />
})

// ❌ DON'T - Import everything at top level
import HeavyChart from './Chart'
```

### Scroll Events
```tsx
// ✅ DO THIS
import { throttle } from '@/lib/performance'
const handleScroll = throttle(() => { /* logic */ }, 100)
window.addEventListener('scroll', handleScroll, { passive: true })

// ❌ DON'T - Blocks at 60+ events per second
window.addEventListener('scroll', () => { /* logic */ })
```

## 📊 Cache TTL Quick Guide

| Data Type | TTL | Usage |
|-----------|-----|-------|
| User profile | 600s | Stable, change rare |
| Dashboard stats | 300s | Updates often |
| Inventory list | 1800s | Semi-static |
| Live activity | 30s | Real-time data |
| Master data | 3600s | Never changes |
| Session state | 0 | No storage |

## ⚡ Performance Classes

### Apply to interactive elements:
```html
<!-- GPU acceleration for animations -->
<div class="gpu-accelerate">...</div>

<!-- Optimized list rendering -->
<div class="list-optimize">...</div>

<!-- Interactive elements -->
<button class="interactive-optimized">Click me</button>

<!-- Contain rendering to box -->
<div class="contain-paint">...</div>
```

## 🔧 Debugging Checklist

Before optimizing, check these:

- [ ] Open DevTools → Lighthouse → Run audit
- [ ] Check LCP, FID, CLS scores
- [ ] DevTools → Network → Check image sizes
- [ ] DevTools → Performance → Record 2-3s, check FPS
- [ ] DevTools → Coverage → Check unused CSS/JS

## 📈 Performance Monitoring

```tsx
import { PerformanceMonitor } from '@/lib/performance'

// Track operation timing
PerformanceMonitor.markStart('operation')
// ... do work ...
PerformanceMonitor.markEnd('operation')
const duration = PerformanceMonitor.getMetrics('operation')
console.log(`Took ${duration}ms`)
```

## 🚨 Red Flags

🚩 **Check these issues:**
- LCP > 2.5 seconds
- FID > 100 milliseconds
- CLS > 0.1
- Images > 500KB total per page
- Network requests > 50 requests
- Bundle size > 300KB (gzipped)
- Re-renders on every keystroke
- Rendering lists with 1000+ items without virtualization

## 🛠️ Common Fixes

| Problem | Solution |
|---------|----------|
| Slow data loading | Use `useOptimizedData` with caching |
| List lag with 100+ items | Replace with `VirtualList` |
| High memory usage | Implement pagination |
| Janky scrolling | Use `throttle` or passive listeners |
| Large images | Use `OptimizedImage` with AVIF/WebP |
| Slow search | Add `useDebouncedValue` |
| Unnecessary re-renders | Use `React.memo` or `useCallback` |
| Jittery animations | Add `contain: paint` or `will-change` |

## 📝 Code Template

```tsx
'use client'

import { useOptimizedData, useDebouncedValue } from '@/lib/useOptimized'
import { OptimizedImage, VirtualList } from '@/components/OptimizedComponents'

export default function OptimizedPage() {
  // 1. Optimized data loading
  const { data: items, loading } = useOptimizedData(
    'page-items',
    fetchItems,
    { cacheTtl: 300 }
  )

  // 2. Debounced search
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 500)

  // 3. Render efficiently
  if (loading) return <LoadingSkeleton />

  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      
      {/* Virtual list for large datasets */}
      <VirtualList
        items={items.filter(i => i.name.includes(debouncedSearch))}
        itemHeight={50}
        renderItem={(item) => (
          <div key={item.id}>
            <OptimizedImage src={item.image} alt={item.name} width={40} height={40} />
            {item.name}
          </div>
        )}
      />
    </div>
  )
}
```

## 🎓 Key Concepts

- **Caching:** Store data in memory with expiration
- **Deduplication:** Prevent duplicate requests
- **Virtualization:** Render only visible items
- **Lazy loading:** Load content when needed
- **Debouncing:** Delay execution until user stops acting
- **Throttling:** Limit execution frequency
- **Containing:** Tell browser to optimize rendering
- **GPU acceleration:** Use hardware for transforms

## 📚 Learn More

- **Detailed guide:** `PERFORMANCE.md`
- **Utilities:** `app/lib/performance.ts`
- **React hooks:** `app/lib/useOptimized.ts`
- **Components:** `app/components/OptimizedComponents.tsx`
- **Summary:** `SPEED_OPTIMIZATION_SUMMARY.md`

## ⏱️ Quick Time Savings

Implementing these optimizations typically saves:
- **Initial load:** 30-50% faster
- **Data fetching:** 40-80% reduction in requests
- **Scrolling:** 60% smoother (60 FPS maintained)
- **Search:** 90% fewer API calls
- **List rendering:** 100x faster for large lists

---

**Save this in your bookmarks!** 📌
