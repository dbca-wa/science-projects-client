# Pre-Commit Hooks Guide

## Overview

Pre-commit hooks automatically run checks before each commit to ensure code quality and consistency. This guide explains the pre-commit configuration and how to work with it effectively.

## What Are Pre-Commit Hooks?

Pre-commit hooks are scripts that run automatically before a commit is created. They help catch issues early by:

- Checking code style and formatting
- Running linters
- Validating TypeScript types
- Scanning for security issues
- Preventing commits of sensitive data

## Installed Hooks

The project uses the following pre-commit hooks:

### 1. ESLint

**Purpose**: Enforce code quality and style rules

**What it checks**:
- TypeScript/JavaScript syntax errors
- Code style violations
- Unused variables
- Missing dependencies in useEffect
- React best practices

**Configuration**: `.eslintrc.json`

**Manual run**:
```bash
bun run lint
```

**Auto-fix**:
```bash
bun run lint:fix
```

### 2. Prettier

**Purpose**: Enforce consistent code formatting

**What it checks**:
- Indentation (2 spaces)
- Line length (80 characters)
- Semicolons
- Quote style (double quotes)
- Trailing commas

**Configuration**: `.prettierrc`

**Manual run**:
```bash
bun run format:check
```

**Auto-fix**:
```bash
bun run format
```

### 3. TypeScript Type Checking

**Purpose**: Ensure type safety

**What it checks**:
- Type errors
- Missing type definitions
- Invalid type assertions
- Unused variables

**Configuration**: `tsconfig.json`

**Manual run**:
```bash
bun run type-check
```

### 4. Security Scanning

**Purpose**: Detect security vulnerabilities

**What it checks**:
- Hardcoded secrets (API keys, passwords)
- Vulnerable dependencies
- Insecure code patterns

**Manual run**:
```bash
bun audit
```

## Hook Workflow

When you run `git commit`, the following happens:

```
1. Staged files are identified
   ↓
2. ESLint runs on .ts/.tsx files
   ↓
3. Prettier checks formatting
   ↓
4. TypeScript type checking runs
   ↓
5. Security scan runs
   ↓
6. If all pass → Commit succeeds
   If any fail → Commit blocked
```

## Working with Pre-Commit Hooks

### Normal Workflow

```bash
# Stage your changes
git add .

# Commit (hooks run automatically)
git commit -m "feat: Add user profile feature"

# If hooks pass, commit succeeds
# If hooks fail, fix issues and try again
```

### Fixing Hook Failures

#### ESLint Failures

```bash
# View errors
bun run lint

# Auto-fix what can be fixed
bun run lint:fix

# Manually fix remaining issues
# Then commit again
git commit -m "feat: Add user profile feature"
```

#### Prettier Failures

```bash
# Auto-fix formatting
bun run format

# Commit again
git commit -m "feat: Add user profile feature"
```

#### TypeScript Failures

```bash
# View type errors
bun run type-check

# Fix type errors in your code
# Then commit again
git commit -m "feat: Add user profile feature"
```

#### Security Scan Failures

```bash
# View security issues
bun audit

# Fix security issues:
# - Remove hardcoded secrets
# - Update vulnerable dependencies
# - Fix insecure code patterns

# Commit again
git commit -m "feat: Add user profile feature"
```

### Bypassing Hooks (Use Sparingly)

In rare cases, you may need to bypass hooks:

```bash
# Skip all hooks (NOT RECOMMENDED)
git commit --no-verify -m "WIP: Temporary commit"
```

**When to bypass**:
- Creating a WIP commit for backup
- Emergency hotfix (fix hooks in next commit)
- Known false positive from security scan

**When NOT to bypass**:
- "I'll fix it later" (you won't)
- "It's just a small change" (quality matters)
- "The hook is annoying" (it's protecting you)

## Configuration Files

### ESLint Configuration

`.eslintrc.json`:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "react/react-in-jsx-scope": "off"
  }
}
```

### Prettier Configuration

`.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### TypeScript Configuration

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## IDE Integration

### VS Code

Install recommended extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

Configure settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### WebStorm/IntelliJ

1. Enable ESLint:
   - Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
   - Check "Automatic ESLint configuration"

2. Enable Prettier:
   - Settings → Languages & Frameworks → JavaScript → Prettier
   - Check "On save"

3. Enable TypeScript:
   - Settings → Languages & Frameworks → TypeScript
   - Check "TypeScript Language Service"

## Troubleshooting

### Hook Not Running

**Issue**: Pre-commit hooks don't run

**Solutions**:
```bash
# Reinstall hooks
rm -rf .git/hooks
git init

# Check Git hooks directory
ls -la .git/hooks

# Ensure hooks are executable
chmod +x .git/hooks/pre-commit
```

### Hook Running Slowly

**Issue**: Hooks take too long to run

**Solutions**:
- Run linters only on staged files (already configured)
- Skip type checking for large codebases (not recommended)
- Use faster linters (already using ESLint)

### False Positives

**Issue**: Hook reports errors that aren't real issues

**Solutions**:
```bash
# For ESLint false positives
# Add to .eslintrc.json:
{
  "rules": {
    "rule-name": "off"
  }
}

# For Prettier conflicts with ESLint
# Install eslint-config-prettier:
bun add -D eslint-config-prettier
```

### Merge Conflicts in Lock Files

**Issue**: Pre-commit fails due to lock file conflicts

**Solutions**:
```bash
# Regenerate lock file
rm bun.lockb
bun install

# Commit again
git add bun.lockb
git commit -m "fix: Regenerate lock file"
```

## Best Practices

### Before Committing

1. **Run checks manually**:
   ```bash
   bun run lint
   bun run format:check
   bun run type-check
   ```

2. **Fix issues before staging**:
   ```bash
   bun run lint:fix
   bun run format
   ```

3. **Test your changes**:
   ```bash
   bun run test
   ```

4. **Review your changes**:
   ```bash
   git diff --staged
   ```

### During Development

1. **Enable format on save** in your IDE
2. **Run linter in watch mode** for immediate feedback
3. **Fix issues as you code**, don't accumulate them
4. **Commit frequently** with small, focused changes

### Code Review

1. **Ensure hooks passed** before requesting review
2. **Run full test suite** before pushing
3. **Check CI/CD pipeline** after pushing
4. **Address review feedback** and re-run hooks

## Common Errors and Solutions

### Error: "Unexpected any"

```typescript
// ❌ BAD
const data: any = JSON.parse(response);

// ✅ GOOD
const data: unknown = JSON.parse(response);
if (isValidData(data)) {
  // Use data safely
}
```

### Error: "Missing semicolon"

```typescript
// ❌ BAD
const name = "John"

// ✅ GOOD
const name = "John";
```

### Error: "Unused variable"

```typescript
// ❌ BAD
const [data, setData] = useState();

// ✅ GOOD (if setData is unused)
const [data] = useState();

// ✅ GOOD (if you need it later)
const [data, setData] = useState();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
```

### Error: "Missing dependency in useEffect"

```typescript
// ❌ BAD
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// ✅ GOOD
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### Error: "Hardcoded secret detected"

```typescript
// ❌ BAD
const API_KEY = "sk_live_1234567890";

// ✅ GOOD
const API_KEY = import.meta.env.VITE_API_KEY;
```

## Continuous Integration

Pre-commit hooks also run in CI/CD:

```yaml
# .github/workflows/ci.yml
- name: Lint
  run: bun run lint

- name: Format Check
  run: bun run format:check

- name: Type Check
  run: bun run type-check

- name: Security Scan
  run: bun audit
```

**Benefits**:
- Catches issues missed locally
- Ensures all contributors follow standards
- Prevents broken code from merging

## Customising Hooks

### Adding New Hooks

1. **Install hook package**:
   ```bash
   bun add -D new-hook-package
   ```

2. **Configure in package.json**:
   ```json
   {
     "scripts": {
       "new-hook": "new-hook-command"
     }
   }
   ```

3. **Add to pre-commit**:
   ```bash
   # Update .git/hooks/pre-commit
   ```

### Disabling Hooks

To disable a specific hook:

```json
// package.json
{
  "scripts": {
    "lint": "echo 'Linting disabled'"
  }
}
```

**Not recommended** - hooks exist for a reason!

## Related Documentation

- [Code Style Guide](./code-style.md) - Code style standards
- [Testing Guide](./testing-guide.md) - Testing practices
- [Feature Development](./feature-development.md) - Development workflow
- [Getting Started](./getting-started.md) - Setup and installation

## External Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Pre-commit Framework](https://pre-commit.com/)

---

**Date**: 13-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
