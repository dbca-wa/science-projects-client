# ADR-004: Vite Build Tool Selection

## Context

The SPMS frontend application required a modern build tool that could:

- Provide fast development server with hot module replacement (HMR)
- Support TypeScript compilation without additional configuration
- Generate optimised production builds
- Handle code splitting and lazy loading
- Support modern JavaScript features (ES modules)
- Integrate with React 19 and other modern libraries
- Provide good developer experience with fast feedback
- Support CSS preprocessing (Tailwind CSS)
- Enable plugin ecosystem for extensibility

The original application used Create React App (CRA), which had several limitations:
- Slow development server startup
- Slow hot module replacement
- Complex configuration with ejecting
- Outdated dependencies
- No longer actively maintained

During the refactor, we needed a modern build tool that could support React 19, TypeScript, Tailwind CSS v4, and provide excellent developer experience.

## Decision

We will use **Vite** as the build tool and development server for the SPMS frontend application.

**Key components:**
- Vite dev server with instant HMR
- Rollup for production builds
- Native ES modules in development
- Built-in TypeScript support
- Plugin system for extensibility
- Optimised production builds with code splitting

## Consequences

### Positive Consequences

- **Fast Development Server**: Instant server start (< 1 second)
- **Instant HMR**: Changes reflect immediately without full reload
- **Native ES Modules**: No bundling in development, faster updates
- **TypeScript Support**: Built-in TypeScript compilation
- **Simple Configuration**: Minimal configuration required
- **Modern Features**: Supports latest JavaScript and CSS features
- **Optimised Builds**: Rollup generates efficient production bundles
- **Plugin Ecosystem**: Rich plugin ecosystem for extensibility
- **Active Development**: Actively maintained by Evan You and community
- **Great Documentation**: Comprehensive and well-written documentation

### Negative Consequences

- **Newer Tool**: Less mature than Webpack (though widely adopted)
- **Browser Support**: Requires modern browsers (ES2015+)
- **Plugin Compatibility**: Some Webpack plugins don't have Vite equivalents
- **Learning Curve**: Different mental model from Webpack
- **Build Differences**: Development and production use different module systems

### Neutral Consequences

- **Rollup for Production**: Uses Rollup instead of Webpack for builds
- **ES Modules**: Requires understanding of ES module system
- **Configuration Format**: Uses different configuration format than Webpack

## Alternatives Considered

### Webpack 5

**Description**: Mature, widely-used bundler with extensive plugin ecosystem

**Why not chosen**:
- Slower development server startup
- Slower hot module replacement
- More complex configuration
- Requires additional plugins for TypeScript and React
- Heavier and slower than Vite

**Trade-offs**:
- Webpack has larger ecosystem and more plugins
- Better for complex build requirements
- More mature and battle-tested
- Better browser support (can target older browsers)

### Parcel

**Description**: Zero-configuration bundler with automatic optimisations

**Why not chosen**:
- Less control over build configuration
- Smaller community and ecosystem
- Less predictable build behaviour
- Slower than Vite for development
- Less flexible for custom requirements

**Trade-offs**:
- Parcel requires zero configuration
- Simpler for basic projects
- Automatic optimisations

### Rollup

**Description**: Module bundler focused on ES modules

**Why not chosen**:
- No built-in development server
- Requires more configuration for React and TypeScript
- Less suitable for application development (better for libraries)
- No hot module replacement out of the box

**Trade-offs**:
- Rollup generates smaller bundles
- Better for library development
- More control over output format

### esbuild

**Description**: Extremely fast JavaScript bundler written in Go

**Why not chosen**:
- No built-in development server
- Less mature plugin ecosystem
- No hot module replacement
- Better as a build tool than development tool
- Less suitable for complex applications

**Trade-offs**:
- esbuild is faster than Vite for builds
- Simpler architecture
- Better for simple use cases

## Implementation Notes

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          mobx: ['mobx', 'mobx-react-lite'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

### Development Server

```bash
# Start development server
bun run dev

# Server starts instantly (< 1 second)
# HMR updates instantly on file changes
# TypeScript errors shown in browser overlay
```

### Production Build

```bash
# Build for production
bun run build

# Generates optimised bundle in dist/
# Code splitting for routes and vendors
# Minification and tree shaking
# Source maps for debugging
```

### Code Splitting

Vite automatically code-splits:
- Route-based splitting with React.lazy
- Manual chunks in rollupOptions
- Dynamic imports

```typescript
// Route-based code splitting
const ProjectsPage = lazy(() => import('@/pages/projects/ProjectsPage'));

// Dynamic import
const loadHeavyModule = () => import('./heavy-module');
```

### Environment Variables

```typescript
// Access environment variables
const apiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

### Plugin Integration

```typescript
// Add plugins for additional functionality
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }), // Bundle analysis
  ],
});
```

### Dependencies

```json
{
  "vite": "^6.0.0",
  "@vitejs/plugin-react": "^4.3.0"
}
```

### Development Workflow

1. **Start dev server**: `bun run dev`
2. **Make changes**: Edit files in src/
3. **Instant feedback**: Changes reflect immediately
4. **Type checking**: `bun run type-check`
5. **Build**: `bun run build`
6. **Preview**: `bun run preview`

### Performance Metrics

**Development**:
- Server start: < 1 second
- HMR update: < 100ms
- TypeScript compilation: Instant

**Production**:
- Build time: ~30 seconds
- Bundle size: ~500KB (gzipped)
- Initial load: < 3 seconds on 3G

## Related Documentation

- [ADR-001: React 19 + TypeScript](./ADR-001-react-typescript.md) - Framework choice
- [CI/CD Overview](../../general/deployment/ci-cd-overview.md) - Build and deployment configuration
- [Code Splitting Guide](../performance/code-splitting.md) - Code splitting strategies
- [Vite Documentation](https://vitejs.dev/)
- [Vite Plugin List](https://vitejs.dev/plugins/)

---

**Date**: 14-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
