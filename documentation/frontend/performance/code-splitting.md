# Code Splitting Guide

## Overview

Code splitting is a technique to split your application into smaller chunks that can be loaded on demand. This reduces the initial bundle size and improves load times, especially for users on slower connections.

## Why Code Splitting?

**Benefits**:
- Faster initial page load
- Reduced bandwidth usage
- Better caching (unchanged chunks stay cached)
- Improved user experience

**Trade-offs**:
- More HTTP requests (mitigated by HTTP/2)
- Slightly more complex build configuration
- Need to handle loading states

## Vite Configuration

The project uses Vite's manual chunk strategy for optimal code splitting:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'query-vendor': ['@tanstack/react-query'],
          'mobx-vendor': ['mobx', 'mobx-react-lite'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],

          // Feature chunks
          'projects': ['./src/features/projects'],
          'users': ['./src/features/users'],
          'caretakers': ['./src/features/caretakers'],
        },
      },
    },
  },
});
```

## Chunk Strategy

### Vendor Chunks

Separate vendor libraries into chunks based on update frequency:

**react-vendor** (rarely changes):
- react
- react-dom
- react-router

**query-vendor** (occasionally changes):
- @tanstack/react-query

**mobx-vendor** (occasionally changes):
- mobx
- mobx-react-lite

**ui-vendor** (occasionally changes):
- @radix-ui components
- shadcn/ui dependencies

**Why separate vendors?**
- React rarely updates → long cache lifetime
- UI libraries update more frequently → separate cache
- Better cache hit rate for users

### Feature Chunks

Split features into separate chunks:

```typescript
manualChunks: {
  'projects': ['./src/features/projects'],
  'users': ['./src/features/users'],
  'caretakers': ['./src/features/caretakers'],
  'dashboard': ['./src/features/dashboard'],
}
```

**Benefits**:
- Users only download features they use
- Feature updates don't invalidate other chunks
- Parallel loading of multiple features

### Shared Chunk

Common code shared across features:

```typescript
manualChunks: {
  'shared': ['./src/shared'],
}
```

**Contains**:
- Shared components
- Shared hooks
- Shared utilities
- Shared types

## Route-Based Code Splitting

Use React's lazy loading for route-based splitting:

```typescript
// app/router.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';

// Lazy load pages
const ProjectListPage = lazy(() => import('@/pages/projects/ProjectListPage'));
const ProjectDetailPage = lazy(() => import('@/pages/projects/ProjectDetailPage'));
const UserListPage = lazy(() => import('@/pages/users/UserListPage'));

export const router = createBrowserRouter([
  {
    path: '/projects',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProjectListPage />
      </Suspense>
    ),
  },
  {
    path: '/projects/:id',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProjectDetailPage />
      </Suspense>
    ),
  },
  {
    path: '/users',
    element: (
      <Suspense fallback={<PageLoader />}>
        <UserListPage />
      </Suspense>
    ),
  },
]);
```

**Benefits**:
- Each route is a separate chunk
- Routes load only when navigated to
- Automatic code splitting by Vite

## Dynamic Imports

Use dynamic imports for components loaded conditionally:

```typescript
// Load heavy component only when needed
const HeavyChart = lazy(() => import('./HeavyChart'));

export function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>
        Show Chart
      </button>

      {showChart && (
        <Suspense fallback={<Skeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

**Use cases**:
- Heavy visualisation libraries
- Rich text editors
- PDF viewers
- Large data tables

## Loading States

Always provide loading states for lazy-loaded components:

```typescript
// Page-level loading
<Suspense fallback={<PageLoader />}>
  <ProjectListPage />
</Suspense>

// Component-level loading
<Suspense fallback={<Skeleton className="h-64 w-full" />}>
  <HeavyChart />
</Suspense>

// Inline loading
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

### Loading Components

```typescript
// components/PageLoader.tsx
export function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}

// components/Skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-muted rounded", className)} />
  );
}
```

## Preloading

Preload chunks that will likely be needed:

```typescript
// Preload on hover
function ProjectCard({ project }: { project: IProjectData }) {
  const handleMouseEnter = () => {
    // Preload detail page
    import('@/pages/projects/ProjectDetailPage');
  };

  return (
    <Link
      to={`/projects/${project.id}`}
      onMouseEnter={handleMouseEnter}
    >
      {project.title}
    </Link>
  );
}
```

```typescript
// Preload on route change
router.subscribe((state) => {
  if (state.location.pathname === '/projects') {
    // Preload detail page (likely next navigation)
    import('@/pages/projects/ProjectDetailPage');
  }
});
```

## Analysing Bundle Size

### Bundle Analyser

Use Vite's bundle analyser to visualise chunk sizes:

```bash
# Install analyser
bun add -D rollup-plugin-visualizer

# Update vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});

# Build and analyse
bun run build
```

### Analysing Output

Look for:
- **Large chunks** (>500KB) - consider splitting further
- **Duplicate code** - move to shared chunk
- **Unused dependencies** - remove from package.json
- **Heavy libraries** - consider lighter alternatives

### Size Targets

**Initial bundle** (before code splitting):
- Target: <500KB gzipped
- Maximum: 1MB gzipped

**After code splitting**:
- Main chunk: <200KB gzipped
- Vendor chunks: <300KB total gzipped
- Feature chunks: <100KB each gzipped

## Best Practices

### Do Split

✅ **Large features** (>100KB)
```typescript
manualChunks: {
  'projects': ['./src/features/projects'],
}
```

✅ **Heavy libraries** (chart libraries, editors)
```typescript
const ChartComponent = lazy(() => import('./ChartComponent'));
```

✅ **Rarely used features** (admin panels, settings)
```typescript
const AdminPanel = lazy(() => import('./AdminPanel'));
```

✅ **Route-based pages**
```typescript
const ProjectDetailPage = lazy(() => import('./ProjectDetailPage'));
```

### Don't Split

❌ **Small components** (<10KB)
```typescript
// Don't lazy load small components
import { Button } from './Button'; // Not lazy
```

❌ **Critical path components** (above the fold)
```typescript
// Don't lazy load header/navigation
import { Header } from './Header'; // Not lazy
```

❌ **Frequently used utilities**
```typescript
// Don't split small utilities
import { formatDate } from './utils'; // Not lazy
```

### Chunk Naming

Use descriptive chunk names:

```typescript
// ✅ GOOD: Descriptive names
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'projects-feature': ['./src/features/projects'],
}

// ❌ BAD: Generic names
manualChunks: {
  'vendor1': ['react', 'react-dom'],
  'chunk1': ['./src/features/projects'],
}
```

### Loading States

Always provide meaningful loading states:

```typescript
// ✅ GOOD: Specific loading state
<Suspense fallback={<ProjectListSkeleton />}>
  <ProjectList />
</Suspense>

// ❌ BAD: Generic loading
<Suspense fallback={<div>Loading...</div>}>
  <ProjectList />
</Suspense>
```

## Common Patterns

### Modal with Heavy Content

```typescript
const HeavyModalContent = lazy(() => import('./HeavyModalContent'));

export function MyModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <HeavyModalContent />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
```

### Tab with Heavy Content

```typescript
const ProjectAnalytics = lazy(() => import('./ProjectAnalytics'));
const ProjectReports = lazy(() => import('./ProjectReports'));

export function ProjectTabs() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ProjectOverview />
      </TabsContent>

      <TabsContent value="analytics">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <ProjectAnalytics />
        </Suspense>
      </TabsContent>

      <TabsContent value="reports">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <ProjectReports />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
```

### Conditional Feature

```typescript
const AdminPanel = lazy(() => import('./AdminPanel'));

export function Dashboard() {
  const { isAdmin } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>

      {isAdmin && (
        <Suspense fallback={<Skeleton className="h-64" />}>
          <AdminPanel />
        </Suspense>
      )}
    </div>
  );
}
```

## Troubleshooting

### Issue: Chunk Load Failed

**Cause**: User has old version cached, new chunks deployed

**Solution**: Implement version checking and force reload

```typescript
// Check version on focus
window.addEventListener('focus', async () => {
  const response = await fetch('/version.json');
  const { version } = await response.json();

  if (version !== currentVersion) {
    window.location.reload();
  }
});
```

### Issue: Too Many Chunks

**Cause**: Over-splitting creates too many HTTP requests

**Solution**: Combine related chunks

```typescript
// ❌ BAD: Too granular
manualChunks: {
  'button': ['./src/components/Button'],
  'input': ['./src/components/Input'],
  'select': ['./src/components/Select'],
}

// ✅ GOOD: Grouped
manualChunks: {
  'ui-components': [
    './src/components/Button',
    './src/components/Input',
    './src/components/Select',
  ],
}
```

### Issue: Duplicate Code in Chunks

**Cause**: Shared code not extracted to common chunk

**Solution**: Extract to shared chunk

```typescript
manualChunks: {
  'shared': ['./src/shared'],
  'projects': ['./src/features/projects'],
  'users': ['./src/features/users'],
}
```

## Monitoring

### Performance Metrics

Track code splitting effectiveness:

```typescript
// Track chunk load times
performance.mark('chunk-start');
await import('./HeavyComponent');
performance.mark('chunk-end');

const measure = performance.measure('chunk-load', 'chunk-start', 'chunk-end');
console.log(`Chunk loaded in ${measure.duration}ms`);
```

### Error Tracking

Track chunk load failures:

```typescript
window.addEventListener('error', (event) => {
  if (event.message.includes('Loading chunk')) {
    // Log to error tracking service
    console.error('Chunk load failed:', event);
  }
});
```

## Related Documentation

- [Bundle Optimisation](./bundle-optimisation.md) - Bundle size optimisation strategies
- [Memoisation](./memoisation.md) - React memoisation patterns
- [Memory Management](./memory-management.md) - Memory management best practices
- [ADR-004: Vite Build Tool](../architecture/ADR-004-vite-build-tool.md) - Build tool decision

## External Resources

- [Vite Code Splitting](https://vitejs.dev/guide/features.html#code-splitting)
- [React Lazy Loading](https://react.dev/reference/react/lazy)
- [Web.dev Code Splitting](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [Rollup Manual Chunks](https://rollupjs.org/configuration-options/#output-manualchunks)

---

**Date**: 13-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
