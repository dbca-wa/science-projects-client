# ADR-008: Web Workers and Content Security Policy Configuration

## Context

The SPMS frontend uses Content Security Policy (CSP) to protect against XSS attacks. Web Workers enable non-blocking image compression, improving UI responsiveness during file uploads.

**Problem:** The `browser-image-compression` library initially attempted to load worker scripts from CDN (`https://cdn.jsdelivr.net/`), violating our strict CSP policy (`script-src 'self'`).

**Solution:** Bundle worker code locally and create blob URLs at runtime, maintaining strict CSP whilst enabling Web Workers.

## Decision

**Enable Web Workers with local blob URLs** to provide non-blocking image compression whilst maintaining strict CSP.

**Implementation:**
- Worker code bundled locally (no CDN requests)
- Blob URLs created at runtime from bundled code
- Automatic fallback to main thread if worker creation fails
- CSP: `script-src 'self' blob:`, `script-src-elem 'self' blob:`, `worker-src 'self' blob:`
- CSP violations reported to Sentry in production

## Consequences

### Positive
- Non-blocking compression (UI remains responsive)
- ~10-20% faster compression for large files
- Strict CSP maintained (no external scripts)
- Automatic fallback if workers unavailable
- CSP violations monitored via Sentry

### Negative
- Increased configuration complexity
- Must maintain `worker-src 'self' blob:` in CSP
- Older browsers without Worker API fall back to main thread

### Trade-offs
- Slight complexity increase justified by UX improvements
- Can disable via configuration flag if needed

## Alternatives Considered

### 1. Keep Web Workers Disabled
- Simpler configuration, no CSP complexity
- **Rejected:** Blocks main thread, poor UX for large files

### 2. Relaxed CSP (Allow External Scripts)
- Would allow CDN loading
- **Rejected:** Unacceptable security risk for government application

### 3. Service Workers
- Better for offline/PWA features
- **Rejected:** Overkill for image compression, more complex than needed

## Implementation

### CSP Configuration

**Production** (`vite.config.ts`):
```typescript
const CSP_CONFIG = {
  production: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "blob:"],        // blob: for worker scripts
    scriptSrcElem: ["'self'", "blob:"],    // for script element loading
    workerSrc: ["'self'", "blob:"],
    styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind requires unsafe-inline
    imgSrc: ["'self'", "data:", "blob:", "https:"],
    fontSrc: ["'self'", "data:"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    reportUri: "/api/csp-report",
  },
};
```

**Development:** Adds `'unsafe-inline' 'unsafe-eval'` to `scriptSrc` for HMR, and `localhost:8000` to `connectSrc` for local backend.

### Worker Blob URL Creation

**`compression-worker.ts`:**
```typescript
import WorkerCode from "browser-image-compression/dist/browser-image-compression.js?raw";

export function getCompressionWorkerUrl(): string | null {
  try {
    const blob = new Blob([WorkerCode], { type: "application/javascript" });
    return URL.createObjectURL(blob); // e.g., blob:http://localhost:3000/abc-123
  } catch (error) {
    console.error("Failed to create worker blob URL:", error);
    return null;
  }
}
```

### Image Compression Integration

**`image-compression.utils.ts`:**
```typescript
export const compressImage = async (
  file: File,
  options: CompressImageOptions = {}
): Promise<CompressionResult> => {
  const { useWebWorker = getWorkerConfig().useWebWorker } = options;
  const workerUrl = useWebWorker ? getCompressionWorkerUrl() : undefined;

  try {
    const compressionOptions = {
      maxSizeMB,
      useWebWorker: actualUseWebWorker,
      maxWidthOrHeight: maxDimension,
      libURL: workerUrl, // Pass local blob URL instead of CDN
    };

    const compressedBlob = await imageCompression(file, compressionOptions);
    // ... return result with metrics
  } catch (error) {
    // Automatic fallback if worker failed
    if (useWebWorker && getWorkerConfig().fallbackToMainThread) {
      return compressImage(file, { ...options, useWebWorker: false });
    }
    throw error;
  }
};
```

### Worker Detection

**`worker.utils.ts`:**
```typescript
export function canUseWebWorkers(): boolean {
  if (typeof Worker === "undefined") return false;

  try {
    const testWorker = new Worker(
      URL.createObjectURL(new Blob([""], { type: "application/javascript" }))
    );
    testWorker.terminate();
    return true;
  } catch (error) {
    console.warn("Web Workers blocked by CSP:", error);
    return false;
  }
}

export function getWorkerConfig(): WorkerConfig {
  return {
    useWebWorker: canUseWebWorkers(),
    fallbackToMainThread: true,
    logPerformance: import.meta.env.DEV,
  };
}
```

## CSP Directives Reference

### Key Directives

| Directive | Production | Development | Purpose |
|-----------|------------|-------------|---------|
| `script-src` | `'self' blob:` | `'self' 'unsafe-inline' 'unsafe-eval' blob:` | HMR requires unsafe directives in dev |
| `script-src-elem` | `'self' blob:` | `'self' blob:` | Required for worker script loading |
| `worker-src` | `'self' blob:` | `'self' blob:` | Allow workers from same origin and blob URLs |
| `connect-src` | `'self'` | `'self' localhost:8000` | Local backend in development |
| `style-src` | `'self' 'unsafe-inline'` | `'self' 'unsafe-inline'` | Tailwind requires unsafe-inline |
| `img-src` | `'self' data: blob: https:` | `'self' data: blob: http: https:` | HTTP allowed in dev |

**Why `blob:` is needed:**
- Worker code is bundled locally and converted to blob URL at runtime
- No external CDN requests
- Blob URLs are ephemeral and tied to page origin

**Why `script-src-elem` is needed:**
- When a worker loads a script, browser checks `script-src-elem` first
- Explicitly setting ensures workers can load from blob URLs

## Rollback Procedures

### When to Rollback

Consider disabling Web Workers if:
- CSP violations > 1% of requests
- Worker creation fails > 10% of the time
- Performance degradation observed
- Browser compatibility issues affect > 5% of users

### Rollback Steps

1. **Force disable in configuration:**
   ```typescript
   // src/shared/utils/worker.utils.ts
   export function getWorkerConfig(): WorkerConfig {
     return {
       useWebWorker: false, // Force disable
       fallbackToMainThread: true,
       logPerformance: import.meta.env.DEV,
     };
   }
   ```

2. **Test thoroughly:**
   ```bash
   bun run dev        # Test in development
   bun run build      # Build production
   bun run preview    # Test production build
   ```

3. **Deploy and monitor:**
   - Compression time (should increase slightly)
   - Error rate (should decrease)
   - CSP violations (should drop to zero)

### Re-enabling

If issues are resolved:
1. Identify and fix root cause
2. Update configuration to re-enable
3. Test thoroughly in development and preview
4. Deploy gradually with close monitoring
5. Document lessons learned

## CDN Loading Issue (February 2026)

### Problem
The `browser-image-compression` library attempted to load worker scripts from CDN (`https://cdn.jsdelivr.net/`), violating our strict CSP (`script-src 'self'`).

### Solution
Bundle worker code locally and create blob URLs at runtime:

1. **Import worker as raw string:**
   ```typescript
   import WorkerCode from "browser-image-compression/dist/browser-image-compression.js?raw";
   ```

2. **Create blob URL:**
   ```typescript
   const blob = new Blob([WorkerCode], { type: "application/javascript" });
   const blobUrl = URL.createObjectURL(blob);
   ```

3. **Pass to library:**
   ```typescript
   const compressionOptions = {
     libURL: blobUrl, // Use local blob URL instead of CDN
   };
   ```

4. **Update CSP:**
   ```typescript
   scriptSrc: ["'self'", "blob:"],
   scriptSrcElem: ["'self'", "blob:"],
   workerSrc: ["'self'", "blob:"],
   ```

### Benefits
- No external CDN requests (security maintained)
- Web Workers work correctly in production
- No CSP violations
- Worker code bundled and versioned with application
- Automatic fallback if blob URL creation fails

## Related Documentation

- [ADR-001: React 19 + TypeScript](./ADR-001-react-typescript.md)
- [ADR-004: Vite Build Tool](./ADR-004-vite-build-tool.md)
- [CI/CD Overview](../../general/deployment/ci-cd-overview.md)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Web Workers API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

---

**Date**: 14-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
