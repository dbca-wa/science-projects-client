# ADR-005: Tailwind CSS + shadcn/ui

## Context

The SPMS frontend application required a modern styling solution that could:

- Provide consistent design system across the application
- Support responsive design for mobile, tablet, and desktop
- Enable rapid UI development with minimal custom CSS
- Offer accessible, well-tested UI components
- Support dark mode and theming
- Integrate well with React and TypeScript
- Provide good developer experience
- Generate optimised CSS for production

The original application used Chakra UI, which provided:

- Component library with built-in accessibility
- Theme system with design tokens
- Responsive props for mobile-first design
- Dark mode support

However, Chakra UI had limitations:

- Runtime CSS-in-JS overhead
- Larger bundle size
- Less flexibility for custom designs
- Opinionated component API
- Difficult to customise deeply
- **Migration to v3 REQUIRED**: breaking changes

During the refactor, we needed a styling solution that maintained the benefits of Chakra UI whilst improving performance and flexibility.

## Decision

We will use **Tailwind CSS v4 with shadcn/ui** as the styling solution for the SPMS frontend application.

**Key components:**

- Tailwind CSS v4 for utility-first styling
- shadcn/ui for accessible, customisable components
- Radix UI primitives for component foundations
- CSS variables for theming
- PostCSS for CSS processing
- No runtime CSS-in-JS overhead

**Migration approach:**

- Gradual migration from Chakra UI to Tailwind/shadcn
- Use original application as reference for component behaviour
- Match functionality exactly, improve architecture
- Maintain accessibility standards

## Consequences

### Positive Consequences

- **Zero Runtime Overhead**: No CSS-in-JS runtime, faster performance
- **Smaller Bundle Size**: Only CSS used in application is included
- **Utility-First**: Rapid development with utility classes
- **Full Customisation**: Complete control over component styling
- **Accessible Components**: shadcn/ui built on Radix UI primitives
- **Copy-Paste Components**: Own the component code, modify as needed
- **TypeScript Support**: Excellent TypeScript integration
- **Modern CSS**: Uses CSS variables and modern CSS features
- **Responsive Design**: Mobile-first responsive utilities
- **Dark Mode**: Built-in dark mode support

### Negative Consequences

- **Migration Effort**: Significant effort to migrate from Chakra UI (every component)
- **Learning Curve**: Developers need to learn Tailwind utility classes (acceptable; modern standard)
- **Verbose HTML**: Many utility classes can make HTML verbose
- **Component Library**: Need to build/copy components (not pre-packaged)
- **Design System**: Requires establishing design system conventions

### Neutral Consequences

- **Utility-First Approach**: Different mental model from traditional CSS
- **Component Ownership**: Own component code instead of using library
- **Configuration**: Requires Tailwind configuration for customisation (for shadcn)

## Alternatives Considered

### Chakra UI (Keep Existing)

**Description**: Component library with built-in accessibility and theming

**Why not chosen**:

- Runtime CSS-in-JS overhead impacts performance
- Larger bundle size (~100KB)
- Less flexibility for custom designs
- Opinionated component API
- Difficult to deeply customise
- Migration to v3 would still require significant changes to every component

**Trade-offs**:

- Chakra UI has pre-built components (faster initial development)
- Better for rapid prototyping
- More opinionated (less flexibility)

### Material-UI (MUI)

**Description**: Popular React component library implementing Material Design

**Why not chosen**:

- Runtime CSS-in-JS overhead (Emotion)
- Larger bundle size (~150KB)
- Material Design aesthetic (not desired)
- More complex API
- Heavier components

**Trade-offs**:

- MUI has comprehensive component library
- Better documentation
- Larger community

### Ant Design

**Description**: Enterprise-class UI design language and React component library

**Why not chosen**:

- Opinionated design language
- Larger bundle size (~120KB)
- Less flexibility for customisation
- More suitable for enterprise dashboards
- Heavier components

**Trade-offs**:

- Ant Design has extensive component library
- Better for complex data tables and forms
- More enterprise-focused

### Styled Components + Custom Components

**Description**: CSS-in-JS library with custom component development

**Why not chosen**:

- Runtime CSS-in-JS overhead
- More boilerplate code
- Need to build all components from scratch
- No accessibility primitives
- More maintenance burden

**Trade-offs**:

- Styled Components has full styling control
- Better for unique designs
- More flexible but more work

## Implementation Notes

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: ["./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				// ... more colors
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### shadcn/ui Component Installation

```bash
# Initialise shadcn/ui
bunx shadcn@latest init

# Add components as needed
bunx shadcn@latest add button
bunx shadcn@latest add dialog
bunx shadcn@latest add dropdown-menu
```

### Component Usage

```typescript
// Import shadcn/ui components
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/shared/components/ui/dialog';

// Use with Tailwind utilities
<Button variant="default" size="lg" className="mt-4">
  Submit
</Button>

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### Responsive Design

```typescript
// Mobile-first responsive utilities
<div className="px-4 md:px-8 lg:px-12">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">
    Responsive Heading
  </h1>
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

### Dark Mode

```typescript
// Toggle dark mode
<Button
  variant="ghost"
  size="icon"
  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
>
  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
</Button>

// Dark mode classes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Content adapts to theme
</div>
```

### Custom Component Pattern

```typescript
// Extend shadcn/ui components
import { Button } from '@/shared/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
}

export function LoadingButton({ loading, children, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
```

### MobX Integration

```typescript
// Custom components for MobX reactivity
// Avoid Radix UI components directly with MobX (causes flicker)
import { Popover } from '@/shared/components/ui/custom/CustomPopover';

// CustomPopover wraps Radix with delayed unmount
export const UserMenu = observer(() => {
  const { authStore } = useStores();

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar>
          <AvatarImage src={authStore.state.user?.avatar} />
        </Avatar>
      </PopoverTrigger>
      <PopoverContent>
        {/* Menu content */}
      </PopoverContent>
    </Popover>
  );
});
```

### Migration Strategy

1. **Install Tailwind and shadcn/ui**
2. **Add components incrementally**: Start with most-used components
3. **Reference original app**: Match Chakra UI behaviour exactly
4. **Test accessibility**: Ensure ARIA attributes and keyboard navigation
5. **Update styling**: Replace Chakra props with Tailwind classes
6. **Remove Chakra**: Remove Chakra UI after full migration

### Dependencies

```json
{
	"tailwindcss": "^4.0.0",
	"@radix-ui/react-dialog": "^1.1.0",
	"@radix-ui/react-dropdown-menu": "^2.1.0",
	"@radix-ui/react-popover": "^1.1.0",
	"tailwindcss-animate": "^1.0.7",
	"class-variance-authority": "^0.7.0",
	"clsx": "^2.1.0",
	"tailwind-merge": "^2.5.0"
}
```

## Related Documentation

- [ADR-001: React 19 + TypeScript](./ADR-001-react-typescript.md) - Framework choice
- [Component Organisation Guide](./component-organisation.md) - Component structure
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)

---

**Date**: 14-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
