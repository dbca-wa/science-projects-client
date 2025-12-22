/**
 * Theme Management Utilities
 * 
 * Utilities to help with theme management during the migration from Chakra UI to next-themes
 */

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// ============================================================================
// THEME HOOK REPLACEMENTS
// ============================================================================

/**
 * Replacement for Chakra UI's useColorMode hook
 * Provides the same API but uses next-themes under the hood
 */
export function useColorMode() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure we're mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return {
      colorMode: "light",
      toggleColorMode: () => {},
      setColorMode: () => {},
    };
  }

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  
  return {
    colorMode: resolvedTheme || "light",
    toggleColorMode: () => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    },
    setColorMode: (mode: "light" | "dark" | "system") => {
      setTheme(mode);
    },
  };
}

/**
 * Replacement for Chakra UI's useColorModeValue hook
 * Returns appropriate value based on current theme
 */
export function useColorModeValue<T>(lightValue: T, darkValue: T): T {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? darkValue : lightValue;
}

/**
 * Hook to get theme-aware CSS classes
 * Useful for conditional styling based on theme
 */
export function useThemeClasses(lightClasses: string, darkClasses: string): string {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? darkClasses : lightClasses;
}

/**
 * Hook to check if dark mode is active
 */
export function useIsDarkMode(): boolean {
  const { colorMode } = useColorMode();
  return colorMode === "dark";
}

// ============================================================================
// THEME CONVERSION UTILITIES
// ============================================================================

/**
 * Convert Chakra UI theme tokens to CSS custom properties
 */
export const THEME_TOKENS = {
  colors: {
    // Primary colors
    primary: {
      50: "hsl(var(--primary-50))",
      100: "hsl(var(--primary-100))",
      200: "hsl(var(--primary-200))",
      300: "hsl(var(--primary-300))",
      400: "hsl(var(--primary-400))",
      500: "hsl(var(--primary-500))",
      600: "hsl(var(--primary-600))",
      700: "hsl(var(--primary-700))",
      800: "hsl(var(--primary-800))",
      900: "hsl(var(--primary-900))",
    },
    
    // Gray colors
    gray: {
      50: "hsl(var(--gray-50))",
      100: "hsl(var(--gray-100))",
      200: "hsl(var(--gray-200))",
      300: "hsl(var(--gray-300))",
      400: "hsl(var(--gray-400))",
      500: "hsl(var(--gray-500))",
      600: "hsl(var(--gray-600))",
      700: "hsl(var(--gray-700))",
      800: "hsl(var(--gray-800))",
      900: "hsl(var(--gray-900))",
    },
    
    // Semantic colors
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    muted: "hsl(var(--muted))",
    "muted-foreground": "hsl(var(--muted-foreground))",
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
  },
  
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.75rem",
    "4xl": "2rem",
  },
  
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },
} as const;

/**
 * Get theme token value
 */
export function getThemeToken(path: string): string {
  const keys = path.split(".");
  let value: any = THEME_TOKENS;
  
  for (const key of keys) {
    value = value?.[key];
  }
  
  return value || path;
}

/**
 * Create CSS custom property
 */
export function createCSSVar(name: string, fallback?: string): string {
  return fallback ? `var(--${name}, ${fallback})` : `var(--${name})`;
}

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

/**
 * Breakpoint definitions matching Tailwind CSS defaults
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Hook to get current breakpoint
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<keyof typeof BREAKPOINTS | "base">("base");

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= BREAKPOINTS["2xl"]) {
        setBreakpoint("2xl");
      } else if (width >= BREAKPOINTS.xl) {
        setBreakpoint("xl");
      } else if (width >= BREAKPOINTS.lg) {
        setBreakpoint("lg");
      } else if (width >= BREAKPOINTS.md) {
        setBreakpoint("md");
      } else if (width >= BREAKPOINTS.sm) {
        setBreakpoint("sm");
      } else {
        setBreakpoint("base");
      }
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}

/**
 * Hook to check if screen is at least a certain breakpoint
 */
export function useBreakpointValue<T>(values: Partial<Record<keyof typeof BREAKPOINTS | "base", T>>): T | undefined {
  const currentBreakpoint = useBreakpoint();
  
  // Priority order: current breakpoint, then fallback to smaller breakpoints, then base
  const breakpointOrder: (keyof typeof BREAKPOINTS | "base")[] = ["2xl", "xl", "lg", "md", "sm", "base"];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  // Find the best matching value
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
}

/**
 * Media query hook (replacement for Chakra's useMediaQuery)
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// ============================================================================
// THEME PROVIDER UTILITIES
// ============================================================================

/**
 * Theme configuration for next-themes
 */
export const THEME_CONFIG = {
  attribute: "class",
  defaultTheme: "light",
  enableSystem: true,
  disableTransitionOnChange: false,
  themes: ["light", "dark", "system"],
} as const;

/**
 * CSS variables for theme colors
 * These should be defined in your CSS file
 */
export const CSS_VARIABLES = {
  light: {
    "--background": "0 0% 100%",
    "--foreground": "222.2 84% 4.9%",
    "--muted": "210 40% 98%",
    "--muted-foreground": "215.4 16.3% 46.9%",
    "--popover": "0 0% 100%",
    "--popover-foreground": "222.2 84% 4.9%",
    "--card": "0 0% 100%",
    "--card-foreground": "222.2 84% 4.9%",
    "--border": "214.3 31.8% 91.4%",
    "--input": "214.3 31.8% 91.4%",
    "--primary": "222.2 47.4% 11.2%",
    "--primary-foreground": "210 40% 98%",
    "--secondary": "210 40% 96%",
    "--secondary-foreground": "222.2 47.4% 11.2%",
    "--accent": "210 40% 96%",
    "--accent-foreground": "222.2 47.4% 11.2%",
    "--destructive": "0 84.2% 60.2%",
    "--destructive-foreground": "210 40% 98%",
    "--ring": "222.2 84% 4.9%",
    "--radius": "0.5rem",
  },
  dark: {
    "--background": "222.2 84% 4.9%",
    "--foreground": "210 40% 98%",
    "--muted": "217.2 32.6% 17.5%",
    "--muted-foreground": "215 20.2% 65.1%",
    "--popover": "222.2 84% 4.9%",
    "--popover-foreground": "210 40% 98%",
    "--card": "222.2 84% 4.9%",
    "--card-foreground": "210 40% 98%",
    "--border": "217.2 32.6% 17.5%",
    "--input": "217.2 32.6% 17.5%",
    "--primary": "210 40% 98%",
    "--primary-foreground": "222.2 47.4% 11.2%",
    "--secondary": "217.2 32.6% 17.5%",
    "--secondary-foreground": "210 40% 98%",
    "--accent": "217.2 32.6% 17.5%",
    "--accent-foreground": "210 40% 98%",
    "--destructive": "0 62.8% 30.6%",
    "--destructive-foreground": "210 40% 98%",
    "--ring": "212.7 26.8% 83.9%",
  },
} as const;

/**
 * Generate CSS variable declarations
 */
export function generateThemeCSS(): string {
  const lightVars = Object.entries(CSS_VARIABLES.light)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
    
  const darkVars = Object.entries(CSS_VARIABLES.dark)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");

  return `
:root {
${lightVars}
}

.dark {
${darkVars}
}
`;
}