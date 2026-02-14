# Memory Management Guide

## Overview

Proper memory management prevents memory leaks, reduces memory usage, and improves application performance. This guide covers cleanup patterns, subscription management, and memory leak prevention.

## Common Memory Leaks

### Event Listeners

```typescript
// ❌ BAD: Event listener not cleaned up
export function Component() {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // Missing cleanup!
  }, []);

  return <div>Component</div>;
}

// ✅ GOOD: Event listener cleaned up
export function Component() {
  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div>Component</div>;
}
```

### Timers

```typescript
// ❌ BAD: Timer not cleared
export function Component() {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Tick');
    }, 1000);
    // Missing cleanup!
  }, []);

  return <div>Component</div>;
}

// ✅ GOOD: Timer cleared
export function Component() {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Tick');
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <div>Component</div>;
}
```

### Subscriptions

```typescript
// ❌ BAD: Subscription not unsubscribed
export function Component() {
  useEffect(() => {
    const subscription = observable.subscribe(handleData);
    // Missing cleanup!
  }, []);

  return <div>Component</div>;
}

// ✅ GOOD: Subscription unsubscribed
export function Component() {
  useEffect(() => {
    const subscription = observable.subscribe(handleData);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <div>Component</div>;
}
```

### Async Operations

```typescript
// ❌ BAD: setState after unmount
export function Component() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(result => {
      setData(result); // May run after unmount!
    });
  }, []);

  return <div>{data}</div>;
}

// ✅ GOOD: Check if mounted
export function Component() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchData().then(result => {
      if (isMounted) {
        setData(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return <div>{data}</div>;
}

// ✅ BETTER: Use AbortController
export function Component() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchData({ signal: controller.signal })
      .then(result => setData(result))
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  return <div>{data}</div>;
}
```

## MobX Store Lifecycle

### Store Cleanup

```typescript
class ProjectStore extends BaseStore<ProjectState> {
  private disposers: Array<() => void> = [];

  constructor() {
    super({ projects: [] });
    makeObservable(this, {
      loadProjects: action,
    });

    // Set up reactions
    this.disposers.push(
      reaction(
        () => this.state.filter,
        () => this.loadProjects()
      )
    );
  }

  // Clean up when store is disposed
  dispose() {
    this.disposers.forEach(disposer => disposer());
    this.disposers = [];
  }
}

// Usage in component
export function ProjectList() {
  const store = useMemo(() => new ProjectStore(), []);

  useEffect(() => {
    return () => {
      store.dispose();
    };
  }, [store]);

  return <div>{/* ... */}</div>;
}
```

### Reaction Cleanup

```typescript
class UserStore extends BaseStore<UserState> {
  constructor() {
    super({ users: [] });
    makeObservable(this, {
      selectedUser: computed,
    });
  }

  // ❌ BAD: Reaction not cleaned up
  setupReaction() {
    reaction(
      () => this.state.selectedUserId,
      (userId) => {
        console.log('Selected user:', userId);
      }
    );
  }

  // ✅ GOOD: Reaction cleaned up
  setupReaction() {
    const dispose = reaction(
      () => this.state.selectedUserId,
      (userId) => {
        console.log('Selected user:', userId);
      }
    );

    return dispose; // Return disposer
  }
}
```

## TanStack Query Cleanup

### Query Cancellation

```typescript
// ✅ GOOD: Query automatically cancelled on unmount
export function UserProfile({ userId }: { userId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['users', 'detail', userId],
    queryFn: ({ signal }) => getUserProfile(userId, { signal }),
  });

  return <div>{data?.username}</div>;
}

// Service with AbortSignal support
export async function getUserProfile(
  userId: number,
  options?: { signal?: AbortSignal }
): Promise<IUserData> {
  const response = await fetch(`/api/v1/users/${userId}`, {
    signal: options?.signal,
  });
  return response.json();
}
```

### Mutation Cleanup

```typescript
export function UserEditForm({ userId }: { userId: number }) {
  const mutation = useMutation({
    mutationFn: (data: IUpdateUserData) => updateUser(userId, data),
    onSuccess: () => {
      toast.success('User updated');
    },
  });

  // Mutation automatically cleaned up on unmount
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

## DOM References

### Ref Cleanup

```typescript
// ✅ GOOD: Ref automatically cleaned up
export function Component() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      // Use ref
      ref.current.focus();
    }
  }, []);

  return <div ref={ref}>Component</div>;
}

// ✅ GOOD: Manual cleanup if needed
export function Component() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.addEventListener('custom-event', handleEvent);
    }

    return () => {
      if (element) {
        element.removeEventListener('custom-event', handleEvent);
      }
    };
  }, []);

  return <div ref={ref}>Component</div>;
}
```

## Large Data Handling

### Pagination

```typescript
// ✅ GOOD: Load data in pages
export function ProjectList() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['projects', 'list', page, pageSize],
    queryFn: () => getProjects({ page, pageSize }),
    staleTime: 5 * 60_000,
  });

  return (
    <div>
      {data?.results.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <Pagination page={page} onPageChange={setPage} />
    </div>
  );
}
```

### Virtual Scrolling

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function LargeList({ items }: { items: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Data Cleanup

```typescript
// ✅ GOOD: Clear large data when not needed
export function DataViewer() {
  const [data, setData] = useState<LargeDataset | null>(null);

  useEffect(() => {
    loadLargeDataset().then(setData);

    return () => {
      setData(null); // Clear data on unmount
    };
  }, []);

  return <div>{/* Render data */}</div>;
}
```

## Image Handling

### Image Cleanup

```typescript
// ✅ GOOD: Revoke object URLs
export function ImageUpload() {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return <img src={preview || undefined} alt="Preview" />;
}
```

### Lazy Loading Images

```typescript
// ✅ GOOD: Lazy load images
export function ImageGallery({ images }: { images: string[] }) {
  return (
    <div>
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Image ${index}`}
          loading="lazy"
        />
      ))}
    </div>
  );
}
```

## Memory Profiling

### Chrome DevTools

1. Open Chrome DevTools
2. Go to Memory tab
3. Take heap snapshot
4. Perform actions
5. Take another snapshot
6. Compare snapshots

### Detecting Leaks

```typescript
// Add to development environment
if (process.env.NODE_ENV === 'development') {
  // Log component mounts/unmounts
  const originalUseEffect = React.useEffect;
  React.useEffect = (effect, deps) => {
    return originalUseEffect(() => {
      console.log('Effect mounted');
      const cleanup = effect();
      return () => {
        console.log('Effect cleaned up');
        cleanup?.();
      };
    }, deps);
  };
}
```

## Best Practices

### Do Clean Up

✅ **Event listeners**
```typescript
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

✅ **Timers**
```typescript
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  return () => clearTimeout(timer);
}, []);
```

✅ **Subscriptions**
```typescript
useEffect(() => {
  const sub = observable.subscribe(handler);
  return () => sub.unsubscribe();
}, []);
```

✅ **Async operations**
```typescript
useEffect(() => {
  const controller = new AbortController();
  fetchData({ signal: controller.signal });
  return () => controller.abort();
}, []);
```

### Don't Leak

❌ **Forgotten event listeners**
```typescript
// Missing cleanup
window.addEventListener('resize', handleResize);
```

❌ **Uncancelled timers**
```typescript
// Missing cleanup
setInterval(() => {}, 1000);
```

❌ **Unaborted fetches**
```typescript
// Missing abort
fetch('/api/data');
```

## Common Patterns

### Custom Hook with Cleanup

```typescript
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize(); // Initial size
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}
```

### Debounced Effect

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Interval Hook

```typescript
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const timer = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => {
      clearInterval(timer);
    };
  }, [delay]);
}
```

## Related Documentation

- [Code Splitting](./code-splitting.md) - Code splitting strategies
- [Bundle Optimisation](./bundle-optimisation.md) - Bundle size optimisation
- [Memoisation](./memoisation.md) - React memoisation patterns
- [State Management](../architecture/state-management.md) - MobX and TanStack Query patterns

## External Resources

- [React useEffect Cleanup](https://react.dev/reference/react/useEffect#cleanup-function)
- [Chrome DevTools Memory Profiler](https://developer.chrome.com/docs/devtools/memory-problems/)
- [MobX Reactions](https://mobx.js.org/reactions.html)
- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

---

**Date**: 13-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
