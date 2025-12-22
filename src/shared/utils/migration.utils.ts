/**
 * Migration Utilities for Chakra UI to Tailwind CSS
 * 
 * This file contains utility functions to help with the systematic migration
 * from Chakra UI components to Tailwind CSS classes and shadcn/ui components.
 */

import { type ClassValue } from "clsx";
import { cn } from "@/shared/utils";

// ============================================================================
// THEME CONVERSION UTILITIES
// ============================================================================

/**
 * Chakra UI color mappings to Tailwind CSS equivalents
 */
export const CHAKRA_COLOR_MAP = {
  // Chakra grays to Tailwind grays
  "gray.50": "gray-50",
  "gray.100": "gray-100",
  "gray.200": "gray-200",
  "gray.300": "gray-300",
  "gray.400": "gray-400",
  "gray.500": "gray-500",
  "gray.600": "gray-600",
  "gray.700": "gray-700",
  "gray.800": "gray-800",
  "gray.900": "gray-900",
  
  // Chakra blues to Tailwind blues
  "blue.50": "blue-50",
  "blue.100": "blue-100",
  "blue.200": "blue-200",
  "blue.300": "blue-300",
  "blue.400": "blue-400",
  "blue.500": "blue-500",
  "blue.600": "blue-600",
  "blue.700": "blue-700",
  "blue.800": "blue-800",
  "blue.900": "blue-900",
  
  // Chakra reds to Tailwind reds
  "red.50": "red-50",
  "red.100": "red-100",
  "red.200": "red-200",
  "red.300": "red-300",
  "red.400": "red-400",
  "red.500": "red-500",
  "red.600": "red-600",
  "red.700": "red-700",
  "red.800": "red-800",
  "red.900": "red-900",
  
  // Chakra greens to Tailwind greens
  "green.50": "green-50",
  "green.100": "green-100",
  "green.200": "green-200",
  "green.300": "green-300",
  "green.400": "green-400",
  "green.500": "green-500",
  "green.600": "green-600",
  "green.700": "green-700",
  "green.800": "green-800",
  "green.900": "green-900",
  
  // Chakra yellows to Tailwind yellows
  "yellow.50": "yellow-50",
  "yellow.100": "yellow-100",
  "yellow.200": "yellow-200",
  "yellow.300": "yellow-300",
  "yellow.400": "yellow-400",
  "yellow.500": "yellow-500",
  "yellow.600": "yellow-600",
  "yellow.700": "yellow-700",
  "yellow.800": "yellow-800",
  "yellow.900": "yellow-900",
  
  // Common Chakra color shortcuts
  "white": "white",
  "black": "black",
  "transparent": "transparent",
  "current": "current",
} as const;

/**
 * Convert Chakra UI color values to Tailwind CSS color classes
 */
export function convertChakraColor(chakraColor: string, prefix: string = ""): string {
  const mappedColor = CHAKRA_COLOR_MAP[chakraColor as keyof typeof CHAKRA_COLOR_MAP];
  if (mappedColor) {
    return prefix ? `${prefix}-${mappedColor}` : mappedColor;
  }
  
  // Handle dot notation colors (e.g., "blue.500" -> "blue-500")
  if (chakraColor.includes(".")) {
    const converted = chakraColor.replace(".", "-");
    return prefix ? `${prefix}-${converted}` : converted;
  }
  
  // Return as-is if no mapping found
  return prefix ? `${prefix}-${chakraColor}` : chakraColor;
}

/**
 * Chakra UI spacing values to Tailwind CSS spacing
 */
export const CHAKRA_SPACING_MAP = {
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "8": "8",
  "10": "10",
  "12": "12",
  "16": "16",
  "20": "20",
  "24": "24",
  "32": "32",
  "40": "40",
  "48": "48",
  "56": "56",
  "64": "64",
  
  // Chakra fractional spacing
  "0.5": "0.5",
  "1.5": "1.5",
  "2.5": "2.5",
  "3.5": "3.5",
  
  // Chakra named spacing
  "xs": "1",
  "sm": "2",
  "md": "3",
  "lg": "4",
  "xl": "5",
  "2xl": "6",
} as const;

/**
 * Convert Chakra UI spacing to Tailwind CSS spacing
 */
export function convertChakraSpacing(chakraSpacing: string | number): string {
  const spacingStr = String(chakraSpacing);
  return CHAKRA_SPACING_MAP[spacingStr as keyof typeof CHAKRA_SPACING_MAP] || spacingStr;
}

// ============================================================================
// RESPONSIVE BREAKPOINT UTILITIES
// ============================================================================

/**
 * Chakra UI breakpoints to Tailwind CSS breakpoints mapping
 */
export const CHAKRA_BREAKPOINT_MAP = {
  "sm": "sm",      // 320px -> 640px (Tailwind default)
  "md": "md",      // 515px -> 768px (Tailwind default)
  "lg": "lg",      // 960px -> 1024px (Tailwind default)
  "xl": "xl",      // 1455px -> 1280px (Tailwind default)
  "2xl": "2xl",    // 2000px -> 1536px (Tailwind default)
  
  // Custom breakpoints - map to closest Tailwind equivalent
  "over690": "md",
  "740px": "md",
  "768px": "md",
  "mdlg": "lg",
  "1080px": "lg",
  "1200px": "xl",
  "1240px": "xl",
  "1xl": "xl",
  "3xl": "2xl",
  "4xl": "2xl",
} as const;

/**
 * Convert Chakra UI responsive props to Tailwind CSS responsive classes
 */
export function convertResponsiveProps<T>(
  responsiveValue: T | { [key: string]: T },
  converter: (value: T) => string
): string {
  if (typeof responsiveValue === "object" && responsiveValue !== null) {
    const classes: string[] = [];
    
    // Handle base value (no breakpoint)
    if ("base" in responsiveValue) {
      classes.push(converter(responsiveValue.base as T));
    }
    
    // Handle breakpoint-specific values
    Object.entries(responsiveValue).forEach(([breakpoint, value]) => {
      if (breakpoint !== "base") {
        const tailwindBreakpoint = CHAKRA_BREAKPOINT_MAP[breakpoint as keyof typeof CHAKRA_BREAKPOINT_MAP];
        if (tailwindBreakpoint && value !== undefined) {
          classes.push(`${tailwindBreakpoint}:${converter(value as T)}`);
        }
      }
    });
    
    return classes.join(" ");
  }
  
  // Single value, not responsive
  return converter(responsiveValue);
}

// ============================================================================
// COMPONENT PROP CONVERSION HELPERS
// ============================================================================

/**
 * Convert Chakra UI Box/Flex props to Tailwind CSS classes
 */
export interface ChakraBoxProps {
  bg?: string;
  backgroundColor?: string;
  color?: string;
  p?: string | number;
  padding?: string | number;
  m?: string | number;
  margin?: string | number;
  pt?: string | number;
  pr?: string | number;
  pb?: string | number;
  pl?: string | number;
  mt?: string | number;
  mr?: string | number;
  mb?: string | number;
  ml?: string | number;
  w?: string | number;
  width?: string | number;
  h?: string | number;
  height?: string | number;
  minW?: string | number;
  minWidth?: string | number;
  minH?: string | number;
  minHeight?: string | number;
  maxW?: string | number;
  maxWidth?: string | number;
  maxH?: string | number;
  maxHeight?: string | number;
  borderRadius?: string;
  borderColor?: string;
  borderWidth?: string | number;
  shadow?: string;
  boxShadow?: string;
}

export function convertBoxProps(props: ChakraBoxProps): string {
  const classes: string[] = [];
  
  // Background color
  if (props.bg || props.backgroundColor) {
    const bgColor = props.bg || props.backgroundColor!;
    classes.push(convertChakraColor(bgColor, "bg"));
  }
  
  // Text color
  if (props.color) {
    classes.push(convertChakraColor(props.color, "text"));
  }
  
  // Padding
  if (props.p || props.padding) {
    const padding = convertChakraSpacing(props.p || props.padding!);
    classes.push(`p-${padding}`);
  }
  
  // Individual padding
  if (props.pt) classes.push(`pt-${convertChakraSpacing(props.pt)}`);
  if (props.pr) classes.push(`pr-${convertChakraSpacing(props.pr)}`);
  if (props.pb) classes.push(`pb-${convertChakraSpacing(props.pb)}`);
  if (props.pl) classes.push(`pl-${convertChakraSpacing(props.pl)}`);
  
  // Margin
  if (props.m || props.margin) {
    const margin = convertChakraSpacing(props.m || props.margin!);
    classes.push(`m-${margin}`);
  }
  
  // Individual margin
  if (props.mt) classes.push(`mt-${convertChakraSpacing(props.mt)}`);
  if (props.mr) classes.push(`mr-${convertChakraSpacing(props.mr)}`);
  if (props.mb) classes.push(`mb-${convertChakraSpacing(props.mb)}`);
  if (props.ml) classes.push(`ml-${convertChakraSpacing(props.ml)}`);
  
  // Width and height
  if (props.w || props.width) {
    const width = String(props.w || props.width);
    if (width === "100%" || width === "full") {
      classes.push("w-full");
    } else if (width.endsWith("%")) {
      // Convert percentage to Tailwind fraction if possible
      const percent = parseInt(width);
      if (percent === 50) classes.push("w-1/2");
      else if (percent === 33) classes.push("w-1/3");
      else if (percent === 25) classes.push("w-1/4");
      else classes.push(`w-[${width}]`);
    } else {
      classes.push(`w-${convertChakraSpacing(width)}`);
    }
  }
  
  if (props.h || props.height) {
    const height = String(props.h || props.height);
    if (height === "100%" || height === "full") {
      classes.push("h-full");
    } else if (height === "100vh") {
      classes.push("h-screen");
    } else if (height.endsWith("%")) {
      classes.push(`h-[${height}]`);
    } else {
      classes.push(`h-${convertChakraSpacing(height)}`);
    }
  }
  
  // Min/Max dimensions
  if (props.minW || props.minWidth) {
    const minWidth = String(props.minW || props.minWidth);
    classes.push(`min-w-[${minWidth}]`);
  }
  
  if (props.minH || props.minHeight) {
    const minHeight = String(props.minH || props.minHeight);
    if (minHeight === "100vh") {
      classes.push("min-h-screen");
    } else {
      classes.push(`min-h-[${minHeight}]`);
    }
  }
  
  if (props.maxW || props.maxWidth) {
    const maxWidth = String(props.maxW || props.maxWidth);
    classes.push(`max-w-[${maxWidth}]`);
  }
  
  if (props.maxH || props.maxHeight) {
    const maxHeight = String(props.maxH || props.maxHeight);
    classes.push(`max-h-[${maxHeight}]`);
  }
  
  // Border radius
  if (props.borderRadius) {
    const radius = props.borderRadius;
    if (radius === "md") classes.push("rounded-md");
    else if (radius === "lg") classes.push("rounded-lg");
    else if (radius === "xl") classes.push("rounded-xl");
    else if (radius === "full") classes.push("rounded-full");
    else if (radius === "none") classes.push("rounded-none");
    else classes.push(`rounded-[${radius}]`);
  }
  
  // Border
  if (props.borderColor) {
    classes.push(convertChakraColor(props.borderColor, "border"));
  }
  
  if (props.borderWidth) {
    const width = String(props.borderWidth);
    if (width === "1" || width === "1px") classes.push("border");
    else classes.push(`border-${width}`);
  }
  
  // Shadow
  if (props.shadow || props.boxShadow) {
    const shadow = props.shadow || props.boxShadow!;
    if (shadow === "sm") classes.push("shadow-sm");
    else if (shadow === "md") classes.push("shadow-md");
    else if (shadow === "lg") classes.push("shadow-lg");
    else if (shadow === "xl") classes.push("shadow-xl");
    else if (shadow === "none") classes.push("shadow-none");
    else classes.push(`shadow-[${shadow}]`);
  }
  
  return classes.join(" ");
}

/**
 * Convert Chakra UI Flex props to Tailwind CSS classes
 */
export interface ChakraFlexProps extends ChakraBoxProps {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: "wrap" | "nowrap" | "wrap-reverse";
  gap?: string | number;
}

export function convertFlexProps(props: ChakraFlexProps): string {
  const classes: string[] = ["flex"];
  
  // Add box props
  const boxClasses = convertBoxProps(props);
  if (boxClasses) classes.push(boxClasses);
  
  // Flex direction
  if (props.direction) {
    const directionMap = {
      "row": "flex-row",
      "column": "flex-col",
      "row-reverse": "flex-row-reverse",
      "column-reverse": "flex-col-reverse",
    };
    classes.push(directionMap[props.direction]);
  }
  
  // Align items
  if (props.align) {
    const alignMap = {
      "start": "items-start",
      "center": "items-center",
      "end": "items-end",
      "stretch": "items-stretch",
      "baseline": "items-baseline",
    };
    classes.push(alignMap[props.align]);
  }
  
  // Justify content
  if (props.justify) {
    const justifyMap = {
      "start": "justify-start",
      "center": "justify-center",
      "end": "justify-end",
      "between": "justify-between",
      "around": "justify-around",
      "evenly": "justify-evenly",
    };
    classes.push(justifyMap[props.justify]);
  }
  
  // Flex wrap
  if (props.wrap) {
    const wrapMap = {
      "wrap": "flex-wrap",
      "nowrap": "flex-nowrap",
      "wrap-reverse": "flex-wrap-reverse",
    };
    classes.push(wrapMap[props.wrap]);
  }
  
  // Gap
  if (props.gap) {
    const gap = convertChakraSpacing(props.gap);
    classes.push(`gap-${gap}`);
  }
  
  return cn(...classes);
}

/**
 * Convert Chakra UI Grid props to Tailwind CSS classes
 */
export interface ChakraGridProps extends ChakraBoxProps {
  templateColumns?: string;
  templateRows?: string;
  gap?: string | number;
  columnGap?: string | number;
  rowGap?: string | number;
}

export function convertGridProps(props: ChakraGridProps): string {
  const classes: string[] = ["grid"];
  
  // Add box props
  const boxClasses = convertBoxProps(props);
  if (boxClasses) classes.push(boxClasses);
  
  // Grid template columns
  if (props.templateColumns) {
    const cols = props.templateColumns;
    if (cols.includes("repeat(")) {
      // Handle repeat() syntax
      const match = cols.match(/repeat\((\d+),\s*1fr\)/);
      if (match) {
        const count = match[1];
        classes.push(`grid-cols-${count}`);
      } else {
        classes.push(`grid-cols-[${cols}]`);
      }
    } else {
      classes.push(`grid-cols-[${cols}]`);
    }
  }
  
  // Grid template rows
  if (props.templateRows) {
    classes.push(`grid-rows-[${props.templateRows}]`);
  }
  
  // Gap
  if (props.gap) {
    const gap = convertChakraSpacing(props.gap);
    classes.push(`gap-${gap}`);
  }
  
  if (props.columnGap) {
    const gap = convertChakraSpacing(props.columnGap);
    classes.push(`gap-x-${gap}`);
  }
  
  if (props.rowGap) {
    const gap = convertChakraSpacing(props.rowGap);
    classes.push(`gap-y-${gap}`);
  }
  
  return cn(...classes);
}

// ============================================================================
// THEME HOOK REPLACEMENT UTILITIES
// ============================================================================

/**
 * Helper to create theme-aware className strings
 * Replaces useColorModeValue functionality
 */
export function createThemeClasses(lightClass: string, darkClass: string): string {
  return cn(lightClass, `dark:${darkClass}`);
}

/**
 * Convert Chakra useColorModeValue calls to Tailwind classes
 */
export function convertColorModeValue(lightValue: string, darkValue: string, prefix: string = ""): string {
  const lightClass = prefix ? `${prefix}-${convertChakraColor(lightValue)}` : convertChakraColor(lightValue);
  const darkClass = prefix ? `${prefix}-${convertChakraColor(darkValue)}` : convertChakraColor(darkValue);
  
  return createThemeClasses(lightClass, darkClass);
}

// ============================================================================
// COMPONENT PROP VALIDATION
// ============================================================================

/**
 * Type guard to check if a value is a responsive prop object
 */
export function isResponsiveProp<T>(value: T | { [key: string]: T }): value is { [key: string]: T } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Extract className from component props, handling both string and responsive values
 */
export function extractClassName(...classNames: (string | undefined | null | false)[]): string {
  return cn(...classNames.filter(Boolean));
}

// ============================================================================
// MIGRATION HELPER FUNCTIONS
// ============================================================================

/**
 * Quick converter for common Chakra Box usage patterns
 */
export function chakraBoxToTailwind(props: ChakraBoxProps, additionalClasses?: ClassValue[]): string {
  const baseClasses = convertBoxProps(props);
  return cn(baseClasses, ...(additionalClasses || []));
}

/**
 * Quick converter for common Chakra Flex usage patterns
 */
export function chakraFlexToTailwind(props: ChakraFlexProps, additionalClasses?: ClassValue[]): string {
  const baseClasses = convertFlexProps(props);
  return cn(baseClasses, ...(additionalClasses || []));
}

/**
 * Quick converter for common Chakra Grid usage patterns
 */
export function chakraGridToTailwind(props: ChakraGridProps, additionalClasses?: ClassValue[]): string {
  const baseClasses = convertGridProps(props);
  return cn(baseClasses, ...(additionalClasses || []));
}

/**
 * Convert Chakra Center component to Tailwind classes
 */
export function chakraCenterToTailwind(props: ChakraBoxProps = {}): string {
  const baseClasses = convertBoxProps(props);
  return cn("flex items-center justify-center", baseClasses);
}

/**
 * Convert Chakra VStack to Tailwind classes
 */
export function chakraVStackToTailwind(spacing?: string | number, align?: string, props: ChakraBoxProps = {}): string {
  const baseClasses = convertBoxProps(props);
  const classes = ["flex flex-col"];
  
  if (spacing) {
    classes.push(`gap-${convertChakraSpacing(spacing)}`);
  }
  
  if (align) {
    const alignMap: { [key: string]: string } = {
      "start": "items-start",
      "center": "items-center",
      "end": "items-end",
      "stretch": "items-stretch",
    };
    classes.push(alignMap[align] || "items-stretch");
  }
  
  return cn(...classes, baseClasses);
}

/**
 * Convert Chakra HStack to Tailwind classes
 */
export function chakraHStackToTailwind(spacing?: string | number, align?: string, props: ChakraBoxProps = {}): string {
  const baseClasses = convertBoxProps(props);
  const classes = ["flex flex-row"];
  
  if (spacing) {
    classes.push(`gap-${convertChakraSpacing(spacing)}`);
  }
  
  if (align) {
    const alignMap: { [key: string]: string } = {
      "start": "items-start",
      "center": "items-center",
      "end": "items-end",
      "stretch": "items-stretch",
    };
    classes.push(alignMap[align] || "items-center");
  }
  
  return cn(...classes, baseClasses);
}