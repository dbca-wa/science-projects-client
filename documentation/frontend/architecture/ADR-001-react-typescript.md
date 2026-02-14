# ADR-001: React 19 + TypeScript

## Context

The Science Projects Management System (SPMS) frontend required a modern, type-safe UI framework that could support complex state management, real-time updates, and a rich user interface. The application needed to:

- Handle complex business logic for project management, caretaker systems, and user workflows
- Provide a responsive, accessible user interface
- Support real-time data synchronisation with the backend API
- Enable rapid development with strong type safety
- Integrate with modern build tools and development workflows
- Support a large ecosystem of libraries and components

The original application was built with React 18 and Chakra UI. During the refactor to Tailwind CSS and shadcn/ui, we needed to decide whether to upgrade to React 19 and continue with TypeScript.

## Decision

We will use **React 19 with TypeScript** as the foundation for the SPMS frontend application.

**Key components:**

- React 19 for UI rendering and component composition
- TypeScript in strict mode for type safety
- React Hooks for component logic
- React Router (Data Mode) for routing
- Integration with Vite for fast development and optimised builds

## Consequences

### Positive Consequences

- **Strong Type Safety**: TypeScript catches errors at compile time, reducing runtime bugs
- **Excellent Developer Experience**: React DevTools, TypeScript IntelliSense, and hot module replacement provide fast feedback
- **Large Ecosystem**: Access to thousands of React libraries, components, and tools
- **Modern Features**: React 19 provides automatic batching, transitions, suspense, and improved concurrent rendering
- **Component Reusability**: React's component model enables building reusable UI elements
- **Strong Community Support**: Large community, extensive documentation, and active development
- **Career Alignment**: React and TypeScript are industry-standard skills
- **Migration Path**: Smooth upgrade from React 18 to React 19

### Negative Consequences

- **Learning Curve**: Developers need to understand modern Javascript including React concepts (hooks, lifecycle, reconciliation)
- **TypeScript Overhead**: Requires writing type definitions and handling type errors
- **Build Complexity**: Requires build tooling (Vite) for TypeScript compilation and bundling
- **Breaking Changes**: React 19 introduces some breaking changes from React 18
- **Strict Mode Requirements**: TypeScript strict mode can be challenging for complex types

### Neutral Consequences

- **Framework Lock-in**: Committing to React ecosystem and patterns (modern standard)
- **Bundle Size**: React adds ~45KB (gzipped) to the bundle
- **Server-Side Rendering**: Not currently used, but React 19 improves SSR capabilities if needed in future

## Alternatives Considered

### Vue 3 + TypeScript

**Description**: Progressive JavaScript framework with composition API and TypeScript support

**Why not chosen**:

- Smaller ecosystem compared to React
- Team has more React experience
- Fewer component libraries available
- Less alignment with industry hiring trends

**Trade-offs**:

- Vue has simpler learning curve
- Better built-in state management (Pinia)
- Smaller bundle size

### Angular 17 + TypeScript

**Description**: Full-featured framework with built-in TypeScript support

**Why not chosen**:

- Steeper learning curve and more opinionated
- Larger bundle size
- More complex build configuration
- Overkill for application size
- Less flexibility in library choices

**Trade-offs**:

- Angular provides more built-in features (routing, forms, HTTP)
- Better for large enterprise applications
- Stronger opinions on architecture

### Svelte + TypeScript

**Description**: Compiler-based framework with reactive programming model

**Why not chosen**:

- Smaller ecosystem and community
- Fewer component libraries available
- Less mature TypeScript support
- Team unfamiliarity with Svelte patterns
- Riskier for long-term maintenance

**Trade-offs**:

- Svelte has smaller bundle size (no runtime)
- Simpler reactive programming model
- Less boilerplate code

## Implementation Notes

### Key Steps

1. **Project Setup**: Initialise Vite project with React 19 and TypeScript template
2. **TypeScript Configuration**: Enable strict mode and configure paths
3. **ESLint Configuration**: Set up React and TypeScript linting rules
4. **Component Structure**: Establish feature-based directory structure
5. **Type Definitions**: Create shared type definitions for API responses

### TypeScript Configuration

```json
{
	"compilerOptions": {
		"target": "ES2020",
		"lib": ["ES2020", "DOM", "DOM.Iterable"],
		"module": "ESNext",
		"skipLibCheck": true,
		"strict": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"noFallthroughCasesInSwitch": true,
		"jsx": "react-jsx",
		"moduleResolution": "bundler",
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,
		"paths": {
			"@/*": ["./src/*"]
		}
	}
}
```

### React 19 Migration Considerations

- **Automatic Batching**: State updates are automatically batched in React 19
- **Transitions**: Use `useTransition` for non-urgent updates
- **Suspense**: Improved suspense for data fetching (used with TanStack Query)
- **Server Components**: Not used in current implementation, but available for future

### Dependencies

```json
{
	"react": "^19.0.0",
	"react-dom": "^19.0.0",
	"typescript": "^5.6.0"
}
```

## Related Documentation

- [ADR-002: MobX for Client State](./ADR-002-mobx-client-state.md) - Client state management
- [ADR-003: TanStack Query for Server State](./ADR-003-tanstack-query-server-state.md) - Server state management
- [ADR-004: Vite Build Tool](./ADR-004-vite-build-tool.md) - Build tooling
- [Code Style Guide](../development/code-style.md) - TypeScript standards
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Date**: 14-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
