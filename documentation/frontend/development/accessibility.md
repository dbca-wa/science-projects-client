# Accessibility Development Guide

## Overview

This guide provides practical guidance for developing accessible features in the Science Projects Management System. We target WCAG 2.2 Level AA compliance as our minimum standard.

## Target Compliance

**WCAG 2.2 Level AA** - This is our minimum accessibility standard. All new features and components must meet this level.

## Quick Start

### Before You Code

1. **Use semantic HTML** - Buttons for actions, links for navigation
2. **Add labels to inputs** - Every form field needs a label
3. **Provide alt text** - Describe images meaningfully
4. **Test with keyboard** - Tab through your feature
5. **Check colour contrast** - Use DevTools colour picker

### Testing Your Work

```bash
# Run accessibility tests
bun run test --run "a11y"

# Run scanner on your file
node scripts/accessibility/scanner.js src/pages/MyPage.tsx

# Run all tests with coverage
bun run test:coverage
```

## Core Principles

### 1. Semantic HTML First

Use HTML elements that describe what the content IS, not what it looks like.

**Good**:
```tsx
<button type="button" onClick={handleSave}>
  Save Project
</button>

<a href="/projects">View Projects</a>
```

**Bad**:
```tsx
<div onClick={handleSave}>Save Project</div>
<div onClick={() => navigate('/projects')}>View Projects</div>
```

**Why**: Screen readers announce element roles. A `<button>` is announced as "button", a `<div>` is just "group".

### 2. Labels for All Inputs

Every form input must have an associated label.

**Good**:
```tsx
<label htmlFor="project-name">Project Name</label>
<input
  id="project-name"
  type="text"
  value={name}
  onChange={setName}
/>
```

**Bad**:
```tsx
<input
  type="text"
  placeholder="Project Name"
  value={name}
/>
```

**Why**: Screen readers announce the label when the input is focused. Placeholders disappear and aren't always announced.

### 3. Keyboard Accessibility

All interactive elements must be keyboard accessible.

**Test**: Can you Tab to it? Can you activate it with Enter or Space?

**Good**:
```tsx
// Native button - keyboard accessible by default
<button type="button" onClick={handleClick}>
  Click Me
</button>
```

**Acceptable** (when semantic HTML isn't possible):
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click Me
</div>
```

### 4. Colour Contrast

Text must have sufficient contrast against its background.

**Minimum ratios**:
- Normal text: 4.5:1
- Large text (18pt+ or 14pt+ bold): 3:1
- UI components: 3:1

**Test**: Use browser DevTools colour picker to check contrast.

**Good**:
```tsx
<p className="text-gray-900 bg-white">
  High contrast text (21:1 ratio)
</p>
```

**Bad**:
```tsx
<p className="text-gray-400 bg-white">
  Low contrast text (2.8:1 ratio)
</p>
```

## Common Patterns

### Modal Dialogs

Use shadcn Dialog components - they handle focus management automatically.

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <button type="button">Open Dialog</button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Description for screen readers
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <DialogClose asChild>
        <button type="button">Close</button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Form Validation

Associate error messages with inputs using `aria-describedby`.

```tsx
<div>
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <p id="email-error" className="text-red-600" role="alert">
      {errors.email.message}
    </p>
  )}
</div>
```

### Select Dropdowns

Add `aria-label` to shadcn Select components.

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger aria-label="Filter by status">
    <SelectValue placeholder="All Statuses" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="completed">Completed</SelectItem>
  </SelectContent>
</Select>
```

### Icon Buttons

Provide accessible names for icon-only buttons.

```tsx
<button type="button" aria-label="Close dialog">
  <X className="h-4 w-4" aria-hidden="true" />
</button>
```

### Images

Provide descriptive alt text for meaningful images, empty alt for decorative images.

```tsx
// Meaningful image
<img
  src="chart.png"
  alt="Bar chart showing 23% increase in native species"
/>

// Decorative image
<img src="decorative-line.svg" alt="" />
```

## Testing Strategy

### Two-Tier Approach

We use a two-tier testing strategy:

1. **Unit Tests** (90%) - Test functions, hooks, services, stores
2. **Page Tests** (10%) - Test user flows + accessibility

**Don't test components** - They're tested via page tests.

### Writing Accessibility Tests

Create `.a11y.test.tsx` files for pages:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('MyPage Accessibility', () => {
  it('should be accessible', async () => {
    // Dynamic import to ensure mocks are set up first
    const { default: MyPage } = await import('./MyPage');

    const { container } = render(<MyPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Running Tests

```bash
# Run all accessibility tests
bun run test --run "a11y"

# Run specific test
bun run test --run "ProjectListPage.a11y"

# Run with coverage
bun run test:coverage
```

## Pre-commit Checks

The accessibility scanner runs automatically on commit (if enabled).

### Enable/Disable

Edit `package.json`:

```json
{
  "accessibility": {
    "enabled": true,  // Set to false to disable
    "severity": "warning"
  }
}
```

### What Gets Checked

- Semantic HTML violations
- Heading hierarchy issues
- Form accessibility
- ARIA attribute validation
- Image alt text
- Keyboard accessibility

### Bypass (Emergency Only)

```bash
git commit --no-verify -m "emergency fix"
```

## CI/CD Integration

Accessibility checks run automatically on pull requests.

### What Happens

1. Scanner runs on changed `.tsx`/`.jsx` files
2. All accessibility tests run
3. Results posted as PR comment
4. Test results uploaded as artifacts

### Workflow Status

Check the accessibility badge in README or the Actions tab.

**Note**: Accessibility checks are informational and don't block merging.

## Common Issues

### Issue: "Interactive div should be a button"

**Problem**: Using `<div>` with `onClick` handler.

**Fix**: Use `<button>` instead.

```tsx
// Before
<div onClick={handleClick}>Click Me</div>

// After
<button type="button" onClick={handleClick}>
  Click Me
</button>
```

### Issue: "Input missing label"

**Problem**: Form input without associated label.

**Fix**: Add label with `htmlFor`/`id`.

```tsx
// Before
<input type="text" placeholder="Name" />

// After
<label htmlFor="name">Name</label>
<input id="name" type="text" />
```

### Issue: "Image missing alt text"

**Problem**: Image without `alt` attribute.

**Fix**: Add descriptive alt text.

```tsx
// Before
<img src="chart.png" />

// After
<img src="chart.png" alt="Revenue chart showing Q3 growth" />
```

### Issue: "Heading hierarchy skipped"

**Problem**: Jumping from `<h1>` to `<h3>` without `<h2>`.

**Fix**: Use proper heading order.

```tsx
// Before
<h1>Page Title</h1>
<h3>Subsection</h3>

// After
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

### Issue: "Insufficient colour contrast"

**Problem**: Text colour doesn't have enough contrast with background.

**Fix**: Use darker text colour.

```tsx
// Before (2.8:1 ratio)
<p className="text-gray-400 bg-white">Low contrast</p>

// After (10.89:1 ratio)
<p className="text-gray-700 bg-white">Good contrast</p>
```

## Tools and Resources

### Browser Tools

- **Chrome DevTools** - Accessibility pane, colour picker
- **axe DevTools Extension** - Automated accessibility testing
- **WAVE Extension** - Visual accessibility feedback

### Testing Tools

- **axe-core** - Automated accessibility testing library
- **jest-axe** - Jest matchers for axe-core
- **Vitest** - Test runner

### Documentation

- **WCAG 2.2 Guidelines**: https://www.w3.org/WAI/WCAG22/quickref/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **WebAIM Resources**: https://webaim.org/resources/

### Internal Resources

- **Accessibility Guide**: This document - Practical solutions and patterns
- **Semantic HTML**: Use semantic HTML elements for better accessibility

## Decision Trees

### Which Element Should I Use?

```
Need to trigger an action?
├─ YES → <button type="button">
└─ NO → Need to navigate?
    ├─ YES → <a href="...">
    └─ NO → Need to group content?
        ├─ YES → <div> or semantic element
        └─ NO → <span> for inline
```

### Does My Input Need a Label?

```
Is it a form input?
├─ YES → Add <label htmlFor="...">
└─ NO → Is it interactive?
    ├─ YES → Add aria-label
    └─ NO → No label needed
```

### Should I Add Alt Text?

```
Is it an image?
├─ YES → Does it convey information?
│   ├─ YES → Add descriptive alt text
│   └─ NO → Add empty alt (alt="")
└─ NO → Is it an icon button?
    ├─ YES → Add aria-label to button
    └─ NO → No alt needed
```

## Best Practices

### Do

- ✅ Use semantic HTML elements
- ✅ Add labels to all form inputs
- ✅ Provide alt text for images
- ✅ Test with keyboard navigation
- ✅ Check colour contrast
- ✅ Write accessibility tests for pages
- ✅ Run pre-commit checks
- ✅ Review accessibility warnings

### Don't

- ❌ Use divs for buttons or links
- ❌ Use placeholder as only label
- ❌ Skip heading levels
- ❌ Remove focus indicators
- ❌ Use colour alone to convey information
- ❌ Block keyboard navigation
- ❌ Ignore accessibility warnings

## Getting Help

### Questions?

1. Check this guide for patterns
2. Review WCAG 2.2 guidelines
3. Ask in team chat
4. Pair with another developer

### Found an Issue?

1. Check if it's a known pattern
2. Document it in this guide if new
3. Create issue if it affects multiple components
4. Fix it if you can

## Summary

**Remember**: Accessibility is not optional. It's a core requirement for all features and improves Lighthouse scores.

**Key Points**:
- Target WCAG 2.2 Level AA
- Use semantic HTML
- Add labels to inputs
- Test with keyboard
- Check colour contrast
- Write accessibility tests
- Review pre-commit warnings
