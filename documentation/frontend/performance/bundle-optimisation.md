# Bundle Optimisation Guide

## Overview

Bundle optimisation reduces the size of JavaScript bundles sent to users, improving load times and user experience. This guide covers strategies for minimising bundle size while maintaining functionality.

## Why Optimise Bundles?

**Benefits**:
- Faster page loads
- Reduced bandwidth usage
- Better mobile experience
- Improved SEO rankings
- Lower hosting costs

**Metrics**:
- Initial bundle: <200KB gzipped (target)
- Total JavaScript: <500KB gzipped (target)
- First Contentful Paint: <1.8s
- Time to Interactive: <3.9s

## Bundle Analysis

### Visualising Bundle Size

Use Rollup Plugin Visualiser to analyse bundles:

```bash
# Install visualiser
bun add -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
});

# Build and analyse
bun run build
```

### Reading the Analysis

Look for:
- **Large dependencies** (>100KB) - consider alternatives
- **Duplicate code** - consolidate or deduplicate
- **Unused exports** - enable tree shaking
- **Heavy features** - lazy load or split

### Size Budgets

Set size budgets in `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        chunkSizeWarningLimit: 500, // Warn if chunk >500KB
      },
    },
  },
});
```

## Tree Shaking

### What is Tree Shaking?

Tree shaking removes unused code from bundles. Vite automatically tree shakes ES modules.

### Enabling Tree Shaking

```typescript
// ✅ GOOD: Named imports (tree-shakeable)
import { Button, Input } from '@/shared/components/ui';

// ❌ BAD: Namespace imports (not tree-shakeable)
import * as UI from '@/shared/components/ui';
```

### Writing Tree-Shakeable Code

```typescript
// ✅ GOOD: Named exports
export function formatDate(date: Date) { }
export function parseDate(str: string) { }

// ❌ BAD: Default export of object
export default {
  formatDate: (date: Date) => { },
  parseDate: (str: string) => { },
};
```

### Side Effects

Mark packages as side-effect-free in `package.json`:

```json
{
  "sideEffects": false
}
```

Or specify files with side effects:

```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.ts"
  ]
}
```

## Minification

### JavaScript Minification

Vite uses esbuild for fast minification:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'esbuild', // Fast minification
    target: 'es2020',  // Modern browsers
  },
});
```

### CSS Minification

CSS is automatically minified in production:

```typescript
export default defineConfig({
  css: {
    devSourcemap: true, // Source maps in dev
  },
  build: {
    cssMinify: true, // Minify CSS in production
  },
});
```

### Minification Options

```typescript
export default defineConfig({
  build: {
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'], // Remove console.log in production
      legalComments: 'none',          // Remove comments
    },
  },
});
```

## Dependency Optimisation

### Choosing Lightweight Alternatives

Replace heavy dependencies with lighter alternatives:

```typescript
// ❌ HEAVY: moment.js (67KB)
import moment from 'moment';
const formatted = moment(date).format('DD/MM/YYYY');

// ✅ LIGHT: date-fns (2KB per function)
import { format } from 'date-fns';
const formatted = format(date, 'dd/MM/yyyy');

// ❌ HEAVY: lodash (71KB)
import _ from 'lodash';
const result = _.uniq(array);

// ✅ LIGHT: Native JavaScript
const result = [...new Set(array)];

// ❌ HEAVY: axios (13KB)
import axios from 'axios';
const response = await axios.get(url);

// ✅ LIGHT: Native fetch (0KB)
const response = await fetch(url);
```

### Importing Only What You Need

```typescript
// ❌ BAD: Import entire library
import _ from 'lodash';
const result = _.uniq(array);

// ✅ GOOD: Import specific function
import uniq from 'lodash/uniq';
const result = uniq(array);

// ❌ BAD: Import all icons
import * as Icons from 'lucide-react';

// ✅ GOOD: Import specific icons
import { User, Settings, LogOut } from 'lucide-react';
```

### Removing Unused Dependencies

```bash
# Find unused dependencies
bun run depcheck

# Remove unused dependency
bun remove unused-package
```

## Image Optimisation

### Image Formats

Use modern image formats:

```typescript
// ✅ GOOD: WebP for photos (30% smaller than JPEG)
<img src="photo.webp" alt="Photo" />

// ✅ GOOD: SVG for icons (scalable, small)
<img src="icon.svg" alt="Icon" />

// ❌ BAD: PNG for photos (large file size)
<img src="photo.png" alt="Photo" />
```

### Responsive Images

Serve appropriately sized images:

```typescript
<img
  src="photo-800.webp"
  srcSet="
    photo-400.webp 400w,
    photo-800.webp 800w,
    photo-1200.webp 1200w
  "
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="Photo"
/>
```

### Lazy Loading Images

```typescript
<img
  src="photo.webp"
  alt="Photo"
  loading="lazy"
/>
```

## Font Optimisation

### Font Loading Strategy

```css
/* Preload critical fonts */
<link
  rel="preload"
  href="/fonts/inter-var.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>

/* Use font-display: swap */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap; /* Show fallback font while loading */
  font-weight: 100 900;
}
```

### Subsetting Fonts

Include only needed characters:

```bash
# Install pyftsubset
pip install fonttools

# Subset font (Latin characters only)
pyftsubset font.ttf \
  --output-file=font-subset.woff2 \
  --flavor=woff2 \
  --layout-features='*' \
  --unicodes=U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD
```

## CSS Optimisation

### Tailwind CSS Purging

Tailwind automatically purges unused classes:

```typescript
// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Unused classes are removed in production
};
```

### Critical CSS

Inline critical CSS for above-the-fold content:

```html
<!-- Inline critical CSS -->
<style>
  /* Critical styles for above-the-fold content */
  .header { /* ... */ }
  .hero { /* ... */ }
</style>

<!-- Load full CSS asynchronously -->
<link rel="stylesheet" href="/styles.css" media="print" onload="this.media='all'">
```

## Source Maps

### Production Source Maps

Configure source maps for production:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: 'hidden', // Generate source maps but don't reference them
    // or
    sourcemap: false, // Don't generate source maps (smaller bundle)
  },
});
```

**Options**:
- `false`: No source maps (smallest bundle)
- `'hidden'`: Generate but don't reference (for error tracking)
- `true`: Full source maps (largest bundle, for debugging)

## Compression

### Gzip Compression

Enable gzip compression on server:

```nginx
# nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;
gzip_comp_level 6;
```

### Brotli Compression

Brotli provides better compression than gzip:

```bash
# Install vite-plugin-compression
bun add -D vite-plugin-compression

# Add to vite.config.ts
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
});
```

## Build Configuration

### Production Build

Optimised production build configuration:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'query-vendor': ['@tanstack/react-query'],
          'mobx-vendor': ['mobx', 'mobx-react-lite'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
  },
});
```

## Monitoring Bundle Size

### CI/CD Integration

Add bundle size checks to CI/CD:

```yaml
# .github/workflows/ci.yml
- name: Build
  run: bun run build

- name: Check bundle size
  run: |
    SIZE=$(du -sb dist/assets/*.js | awk '{sum+=$1} END {print sum}')
    MAX_SIZE=524288  # 512KB
    if [ $SIZE -gt $MAX_SIZE ]; then
      echo "Bundle size $SIZE exceeds maximum $MAX_SIZE"
      exit 1
    fi
```

### Bundle Size Tracking

Track bundle size over time:

```bash
# Save bundle size
echo "$(date),$(du -sb dist/assets/*.js | awk '{sum+=$1} END {print sum}')" >> bundle-sizes.csv

# Visualise trends
# Use tools like bundlesize or size-limit
```

## Best Practices

### Do Optimise

✅ **Remove unused dependencies**
```bash
bun run depcheck
bun remove unused-package
```

✅ **Use named imports**
```typescript
import { Button } from '@/shared/components/ui/button';
```

✅ **Lazy load heavy features**
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

✅ **Optimise images**
```typescript
<img src="photo.webp" loading="lazy" alt="Photo" />
```

✅ **Enable tree shaking**
```typescript
export function myFunction() { }
```

### Don't Over-Optimise

❌ **Don't micro-optimise**
```typescript
// Don't obsess over saving 1KB
```

❌ **Don't sacrifice readability**
```typescript
// Don't make code unreadable for minor gains
```

❌ **Don't remove useful features**
```typescript
// Don't remove error tracking to save bytes
```

## Common Issues

### Issue: Large Bundle Size

**Diagnosis**:
```bash
bun run build
bunx vite-bundle-visualizer
```

**Solutions**:
- Lazy load heavy features
- Replace heavy dependencies
- Enable tree shaking
- Remove unused code

### Issue: Slow Build Times

**Diagnosis**:
```bash
time bun run build
```

**Solutions**:
- Use esbuild for minification (faster than terser)
- Reduce source map generation
- Disable unnecessary plugins
- Use faster dependencies

### Issue: Large CSS Bundle

**Diagnosis**:
```bash
du -h dist/assets/*.css
```

**Solutions**:
- Ensure Tailwind purging is enabled
- Remove unused CSS
- Use CSS modules for component styles
- Minify CSS

## Related Documentation

- [Code Splitting](./code-splitting.md) - Code splitting strategies
- [Memoisation](./memoisation.md) - React memoisation patterns
- [Memory Management](./memory-management.md) - Memory management best practices
- [ADR-004: Vite Build Tool](../architecture/ADR-004-vite-build-tool.md) - Build tool decision

## External Resources

- [Vite Build Optimisations](https://vitejs.dev/guide/build.html)
- [Web.dev Bundle Size](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [Bundlephobia](https://bundlephobia.com/) - Check package sizes
- [Webpack Bundle Analyser](https://github.com/webpack-contrib/webpack-bundle-analyzer)

---

**Date**: 13-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
