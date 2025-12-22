/**
 * Component Conversion Utilities
 * 
 * Helper functions for converting Chakra UI component props to shadcn/ui equivalents
 */

import { type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

// ============================================================================
// BUTTON COMPONENT UTILITIES
// ============================================================================

/**
 * Convert Chakra UI Button props to shadcn/ui Button props
 */
export interface ChakraButtonProps {
  colorScheme?: "blue" | "red" | "green" | "yellow" | "gray" | "teal" | "purple" | "pink" | "orange";
  variant?: "solid" | "outline" | "ghost" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function convertButtonProps(chakraProps: ChakraButtonProps) {
  const { colorScheme, variant, size, isLoading, isDisabled, leftIcon, rightIcon, ...rest } = chakraProps;
  
  // Convert variant
  let shadcnVariant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" = "default";
  
  if (variant === "outline") {
    shadcnVariant = "outline";
  } else if (variant === "ghost") {
    shadcnVariant = "ghost";
  } else if (variant === "link") {
    shadcnVariant = "link";
  } else if (colorScheme === "red") {
    shadcnVariant = "destructive";
  } else if (variant === "solid" && colorScheme === "gray") {
    shadcnVariant = "secondary";
  }
  
  // Convert size
  let shadcnSize: "default" | "sm" | "lg" | "icon" = "default";
  
  if (size === "xs" || size === "sm") {
    shadcnSize = "sm";
  } else if (size === "lg" || size === "xl") {
    shadcnSize = "lg";
  }
  
  return {
    variant: shadcnVariant,
    size: shadcnSize,
    disabled: isDisabled || isLoading,
    ...rest,
  };
}

// ============================================================================
// INPUT COMPONENT UTILITIES
// ============================================================================

/**
 * Convert Chakra UI Input props to shadcn/ui Input props
 */
export interface ChakraInputProps {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "outline" | "filled" | "flushed" | "unstyled";
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  focusBorderColor?: string;
  errorBorderColor?: string;
}

export function convertInputProps(chakraProps: ChakraInputProps) {
  const { size, variant, isInvalid, isDisabled, isReadOnly, ...rest } = chakraProps;
  
  let className = "";
  
  // Size variations
  if (size === "sm") {
    className = cn(className, "h-8 text-sm");
  } else if (size === "lg") {
    className = cn(className, "h-12 text-lg");
  }
  
  // Variant styles
  if (variant === "filled") {
    className = cn(className, "bg-muted");
  } else if (variant === "flushed") {
    className = cn(className, "border-0 border-b-2 rounded-none");
  } else if (variant === "unstyled") {
    className = cn(className, "border-0 shadow-none");
  }
  
  // State styles
  if (isInvalid) {
    className = cn(className, "border-destructive focus-visible:ring-destructive");
  }
  
  return {
    className: className || undefined,
    disabled: isDisabled,
    readOnly: isReadOnly,
    ...rest,
  };
}

// ============================================================================
// SELECT COMPONENT UTILITIES
// ============================================================================

/**
 * Convert Chakra UI Select props to shadcn/ui Select props
 */
export interface ChakraSelectProps {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "outline" | "filled" | "flushed" | "unstyled";
  placeholder?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
}

export function convertSelectProps(chakraProps: ChakraSelectProps) {
  const { size, variant, placeholder, isInvalid, isDisabled, ...rest } = chakraProps;
  
  return {
    placeholder,
    disabled: isDisabled,
    ...rest,
  };
}

// ============================================================================
// MODAL/DIALOG COMPONENT UTILITIES
// ============================================================================

/**
 * Convert Chakra UI Modal props to shadcn/ui Dialog props
 */
export interface ChakraModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "full";
  isCentered?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  trapFocus?: boolean;
  returnFocusOnClose?: boolean;
}

export function convertModalProps(chakraProps: ChakraModalProps) {
  const { 
    isOpen, 
    onClose, 
    size, 
    closeOnOverlayClick = true, 
    closeOnEsc = true,
    ...rest 
  } = chakraProps;
  
  // Convert size to className for DialogContent
  let sizeClassName = "";
  
  switch (size) {
    case "xs":
      sizeClassName = "max-w-xs";
      break;
    case "sm":
      sizeClassName = "max-w-sm";
      break;
    case "md":
      sizeClassName = "max-w-md";
      break;
    case "lg":
      sizeClassName = "max-w-lg";
      break;
    case "xl":
      sizeClassName = "max-w-xl";
      break;
    case "2xl":
      sizeClassName = "max-w-2xl";
      break;
    case "3xl":
      sizeClassName = "max-w-3xl";
      break;
    case "4xl":
      sizeClassName = "max-w-4xl";
      break;
    case "5xl":
      sizeClassName = "max-w-5xl";
      break;
    case "6xl":
      sizeClassName = "max-w-6xl";
      break;
    case "full":
      sizeClassName = "max-w-full h-full";
      break;
    default:
      sizeClassName = "max-w-lg";
  }
  
  return {
    open: isOpen,
    onOpenChange: (open: boolean) => {
      if (!open) onClose();
    },
    modal: true, // Always modal for Chakra compatibility
    sizeClassName,
    closeOnOverlayClick,
    closeOnEsc,
    ...rest,
  };
}

// ============================================================================
// TABS COMPONENT UTILITIES
// ============================================================================

/**
 * Convert Chakra UI Tabs props to shadcn/ui Tabs props
 */
export interface ChakraTabsProps {
  index?: number;
  defaultIndex?: number;
  onChange?: (index: number) => void;
  orientation?: "horizontal" | "vertical";
  variant?: "line" | "enclosed" | "enclosed-colored" | "soft-rounded" | "solid-rounded" | "unstyled";
  colorScheme?: string;
  size?: "sm" | "md" | "lg";
  isLazy?: boolean;
}

export function convertTabsProps(chakraProps: ChakraTabsProps) {
  const { 
    index, 
    defaultIndex, 
    onChange, 
    orientation = "horizontal",
    variant,
    size,
    ...rest 
  } = chakraProps;
  
  // Convert to value-based system
  const defaultValue = defaultIndex !== undefined ? `tab-${defaultIndex}` : undefined;
  const value = index !== undefined ? `tab-${index}` : undefined;
  
  const onValueChange = onChange ? (newValue: string) => {
    const tabIndex = parseInt(newValue.replace("tab-", ""));
    onChange(tabIndex);
  } : undefined;
  
  let className = "";
  
  // Orientation
  if (orientation === "vertical") {
    className = cn(className, "flex-col");
  }
  
  // Size
  if (size === "sm") {
    className = cn(className, "text-sm");
  } else if (size === "lg") {
    className = cn(className, "text-lg");
  }
  
  return {
    defaultValue,
    value,
    onValueChange,
    orientation,
    className: className || undefined,
    ...rest,
  };
}

// ============================================================================
// TABLE COMPONENT UTILITIES
// ============================================================================

/**
 * Convert Chakra UI Table props to shadcn/ui Table props
 */
export interface ChakraTableProps {
  variant?: "simple" | "striped" | "unstyled";
  colorScheme?: string;
  size?: "sm" | "md" | "lg";
}

export function convertTableProps(chakraProps: ChakraTableProps) {
  const { variant, size, ...rest } = chakraProps;
  
  let className = "";
  
  // Size
  if (size === "sm") {
    className = cn(className, "text-sm");
  } else if (size === "lg") {
    className = cn(className, "text-lg");
  }
  
  // Variant
  if (variant === "striped") {
    className = cn(className, "[&_tr:nth-child(even)]:bg-muted/50");
  }
  
  return {
    className: className || undefined,
    ...rest,
  };
}

// ============================================================================
// FORM COMPONENT UTILITIES
// ============================================================================

/**
 * Convert Chakra UI FormControl props to shadcn/ui form structure
 */
export interface ChakraFormControlProps {
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

export function convertFormControlProps(chakraProps: ChakraFormControlProps) {
  const { isRequired, isInvalid, isDisabled, isReadOnly, ...rest } = chakraProps;
  
  return {
    required: isRequired,
    invalid: isInvalid,
    disabled: isDisabled,
    readOnly: isReadOnly,
    ...rest,
  };
}

// ============================================================================
// TOAST UTILITIES
// ============================================================================

/**
 * Convert Chakra UI toast options to sonner toast options
 */
export interface ChakraToastOptions {
  title?: string;
  description?: string;
  status?: "success" | "error" | "warning" | "info";
  duration?: number;
  isClosable?: boolean;
  position?: "top" | "top-left" | "top-right" | "bottom" | "bottom-left" | "bottom-right";
  onCloseComplete?: () => void;
}

export function convertToastOptions(chakraOptions: ChakraToastOptions) {
  const { 
    title, 
    description, 
    status = "info", 
    duration, 
    isClosable = true,
    position,
    onCloseComplete,
    ...rest 
  } = chakraOptions;
  
  const sonnerOptions = {
    description,
    duration: duration === null ? Infinity : duration,
    dismissible: isClosable,
    onDismiss: onCloseComplete,
    position: position as any, // sonner has different position types
    ...rest,
  };
  
  return {
    message: title || "",
    options: sonnerOptions,
    type: status,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a migration helper for any component
 */
export function createMigrationHelper<TChakraProps, TShadcnProps>(
  converter: (chakraProps: TChakraProps) => TShadcnProps
) {
  return (chakraProps: TChakraProps): TShadcnProps => {
    return converter(chakraProps);
  };
}

/**
 * Merge Chakra props with additional className
 */
export function mergeChakraProps<T extends { className?: string }>(
  props: T,
  additionalClassName?: string
): T {
  return {
    ...props,
    className: cn(props.className, additionalClassName),
  };
}

/**
 * Extract common props that don't need conversion
 */
export function extractCommonProps<T extends Record<string, any>>(
  props: T,
  excludeKeys: (keyof T)[]
): Omit<T, keyof T> {
  const result = { ...props };
  excludeKeys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * Convert event handlers from Chakra to standard React patterns
 */
export function convertEventHandlers(chakraHandlers: {
  onClick?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  onChange?: (value: any) => void;
}) {
  const { onClick, onOpen, onClose, onChange, ...rest } = chakraHandlers;
  
  return {
    onClick,
    onOpenChange: (open: boolean) => {
      if (open && onOpen) onOpen();
      if (!open && onClose) onClose();
    },
    onValueChange: onChange,
    ...rest,
  };
}