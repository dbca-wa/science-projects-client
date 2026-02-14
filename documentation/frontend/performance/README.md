# Frontend Performance Documentation

## Overview

This section contains guides and strategies for optimising the performance of the Science Projects Management System frontend application.

## Contents

### Optimisation Strategies

- [Code Splitting](./code-splitting.md) - Manual chunks and route-based splitting
- [Bundle Optimisation](./bundle-optimisation.md) - Bundle analysis and tree shaking
- [Memoisation](./memoisation.md) - React and MobX memoisation patterns
- [Memory Management](./memory-management.md) - Store lifecycle and cleanup

## Performance Goals

The frontend application aims to achieve:

- **Fast Initial Load**: < 3 seconds on 3G connection
- **Quick Interactions**: < 100ms response time for user actions
- **Efficient Updates**: Minimal re-renders through proper memoisation
- **Small Bundle Size**: < 500KB initial bundle (gzipped)
- **Optimised Assets**: Lazy-loaded routes and code-split vendors

## Performance Monitoring

### Build Analysis

```bash
# Analyse bundle size
bun run build
bun run preview

# Generate bundle visualisation
bun run build --analyze
```

### Runtime Monitoring

- Use React DevTools Profiler for component performance
- Monitor network requests in browser DevTools
- Check memory usage in browser DevTools Memory tab
- Use Lighthouse for performance audits

## Quick Reference

### Code Splitting

```typescript
// Route-based code splitting
const ProjectsPage = lazy(() => import('@/pages/projects/ProjectsPage'));

// Component-based code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Memoisation

```typescript
// React.memo for components
export const UserCard = memo(({ user }: Props) => {
  // Component implementation
});

// useMemo for expensive calculations
const sortedUsers = useMemo(
  () => users.sort((a, b) => a.name.localeCompare(b.name)),
  [users]
);

// MobX computed for derived state
@computed
get activeUsers() {
  return this.users.filter(u => u.isActive);
}
```

## Related Documentation

- [Architecture Guide](../architecture/README.md) - Architectural decisions and patterns
- [Development Guide](../development/README.md) - Development workflow and standards
- [Deployment Guide](../../general/deployment/README.md) - Build and deployment configuration

## External Resources

- [React Performance Optimisation](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
