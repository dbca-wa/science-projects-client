# Accessibility Tools

This directory contains production accessibility tools for the SPMS frontend application.

## Overview

The accessibility tooling provides automated scanning for WCAG 2.2 Level AA compliance and semantic HTML issues. The scanner is integrated into the pre-commit hook to catch accessibility issues early in development.

## Production Tools

### scanner.js

Comprehensive accessibility scanner that checks for WCAG 2.2 Level AA compliance and semantic HTML issues.

**Usage**:

```bash
# Scan specific files
node scripts/accessibility/scanner.js src/pages/Login.tsx

# Scan multiple files
node scripts/accessibility/scanner.js src/pages/*.tsx

# Used automatically by pre-commit hook
```

**Configuration**: Edit `package.json` accessibility section:

```json
{
	"accessibility": {
		"enabled": true,
		"severity": "warning",
		"rules": [
			"semantic-html",
			"aria-attributes",
			"keyboard-navigation",
			"form-labels",
			"alt-text",
			"heading-hierarchy"
		]
	}
}
```

**Rules**:

- `semantic-html` - Checks for proper use of semantic HTML elements
- `aria-attributes` - Validates ARIA attribute usage
- `keyboard-navigation` - Checks for keyboard accessibility
- `form-labels` - Verifies form inputs have proper labels
- `alt-text` - Checks images have appropriate alt text
- `heading-hierarchy` - Validates heading structure

### ast-parser.js

AST-based parser for sophisticated React/TypeScript code analysis. Used by the scanner to extract JSX structure and identify accessibility issues.

**Features**:

- Parses React components to extract JSX structure
- Identifies element types and attributes
- Extracts component hierarchy
- Supports TypeScript and JSX syntax

### contrast-checker.js

Utility for calculating WCAG 2.2 contrast ratios between text and background colours.

**Usage**:

```javascript
import { checkTextContrast } from "./contrast-checker.js";

const result = checkTextContrast("#374151", "#ffffff"); // gray-700 on white
console.log(result.ratio); // "10.89"
console.log(result.valid); // true
```

**Features**:

- Extracts colours from Tailwind CSS classes
- Calculates relative luminance using WCAG formula
- Validates against AA thresholds (4.5:1 normal, 3:1 large text)
- Suggests better colour combinations

## Pre-commit Hook Integration

The scanner is integrated into the frontend pre-commit hook at `.pre-commit-config.yaml`.

**How it works**:

1. When you commit `.tsx` or `.jsx` files
2. Pre-commit hook runs `scripts/pre-commit/check-accessibility.js`
3. That script calls `scripts/accessibility/scanner.js`
4. Scanner checks staged files against enabled rules
5. Warnings are displayed (commits are not blocked)

**To temporarily disable**:

```bash
# Skip pre-commit hooks for one commit
git commit --no-verify -m "message"

# Or disable in package.json
{
  "accessibility": {
    "enabled": false
  }
}
```

## CI/CD Integration

Accessibility checks are integrated into the GitHub Actions workflow. See `.github/workflows/accessibility.yml` for details.

The workflow:

- Runs on pull requests to main and staging
- Scans changed `.tsx` and `.jsx` files
- Runs accessibility tests
- Posts results as PR comment
- Uploads artifacts

## Testing Strategy

### Automated Testing

- Pre-commit scanner catches issues early
- CI/CD workflow validates PRs
- Page tests include axe-core accessibility checks

### Manual Testing

For aspects that cannot be automated:

- Keyboard navigation
- Screen reader compatibility
- Focus management
- Visual inspection

See `documentation/frontend/development/accessibility.md` for complete testing guide.

## Common Issues and Solutions

### Issue: Scanner reports false positives

**Solution**: The scanner uses regex patterns which may have false positives. Review each finding manually and update patterns if needed.

### Issue: Pre-commit hook is too slow

**Solution**: The scanner only runs on staged files. If still slow, disable specific rules in package.json.

### Issue: Need to commit without fixing accessibility issues

**Solution**: Use `git commit --no-verify` to skip pre-commit hooks. Note: This should be rare and issues should be fixed soon after.

## Integration with Documentation

Discovered patterns and solutions are documented in the accessibility development guide at `documentation/frontend/development/accessibility.md`.

When you find a new pattern or solution:

1. Document it in the accessibility guide
2. Follow the Problem/Solution/Example format
3. Reference WCAG criteria
4. Link from development documentation

## Resources

### Internal Documentation

- [Accessibility Development Guide](../../../documentation/frontend/development/accessibility.md)

### External Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WebAIM Resources](https://webaim.org/resources/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Assessment Documentation

For complete assessment documentation and reports, see the project documentation directory.
