/**
 * Component Conversion Utilities
 * 
 * Helper functions for converting component props between different UI libraries
 */

import { cn } from "@/shared/utils";

// ============================================================================
// BUTTON COMPONENT UTILITIES
// ============================================================================

/**
 * Button props interface for conversion
 */
export interface ButtonConversionProps {
  colorScheme?: "blue" | "red" | "green" | "yellow" | "gray" | "teal" | "purple" | "pink" | "orange";
  variant?: "solid" | "outline" | "ghost" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function convertButtonProps(props: ButtonConversionProps) {
  const { colorScheme, variant, size, isLoading, isDisabled, leftIcon, rightIcon, ...rest } = props;
  
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
 * Input props interface for conversion
 */
export interface InputConversionProps {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "outline" | "filled" | "flushed" | "unstyled";
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  focusBorderColor?: string;
  errorBorderColor?: string;
}

export function convertInputProps(props: InputConversionProps) {
  const { size, variant, isInvalid, isDisabled, isReadOnly, ...rest } = props;
  
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
 * Select props interface for conversion
 */
export interface SelectConversionProps {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "outline" | "filled" | "flushed" | "unstyled";
  placeholder?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
}

export function convertSelectProps(props: SelectConversionProps) {
  const { size, variant, placeholder, isInvalid, isDisabled, ...rest } = props;
  
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
 * Modal props interface for conversion
 */
export interface ModalConversionProps {
  isOpen: boolean;
  onClose: () => void;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "full";
  isCentered?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  trapFocus?: boolean;
  returnFocusOnClose?: boolean;
}

export function convertModalProps(props: ModalConversionProps) {
  const { 
    isOpen, 
    onClose, 
    size, 
    closeOnOverlayClick = true, 
    closeOnEsc = true,
    ...rest 
  } = props;
  
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
    modal: true, // Always modal for compatibility
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
 * Tabs props interface for conversion
 */
export interface TabsConversionProps {
  index?: number;
  defaultIndex?: number;
  onChange?: (index: number) => void;
  orientation?: "horizontal" | "vertical";
  variant?: "line" | "enclosed" | "enclosed-colored" | "soft-rounded" | "solid-rounded" | "unstyled";
  colorScheme?: string;
  size?: "sm" | "md" | "lg";
  isLazy?: boolean;
}

export function convertTabsProps(props: TabsConversionProps) {
  const { 
    index, 
    defaultIndex, 
    onChange, 
    orientation = "horizontal",
    variant,
    size,
    ...rest 
  } = props;
  
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
 * Table props interface for conversion
 */
export interface TableConversionProps {
  variant?: "simple" | "striped" | "unstyled";
  colorScheme?: string;
  size?: "sm" | "md" | "lg";
}

export function convertTableProps(props: TableConversionProps) {
  const { variant, size, ...rest } = props;
  
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
 * Form control props interface for conversion
 */
export interface FormControlConversionProps {
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

export function convertFormControlProps(props: FormControlConversionProps) {
  const { isRequired, isInvalid, isDisabled, isReadOnly, ...rest } = props;
  
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
 * Toast options interface for conversion
 */
export interface ToastConversionOptions {
  title?: string;
  description?: string;
  status?: "success" | "error" | "warning" | "info";
  duration?: number;
  isClosable?: boolean;
  position?: "top" | "top-left" | "top-right" | "bottom" | "bottom-left" | "bottom-right";
  onCloseComplete?: () => void;
}

export function convertToastOptions(options: ToastConversionOptions) {
  const { 
    title, 
    description, 
    status = "info", 
    duration, 
    isClosable = true,
    position,
    onCloseComplete,
    ...rest 
  } = options;
  
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
export function createMigrationHelper<TSourceProps, TTargetProps>(
  converter: (sourceProps: TSourceProps) => TTargetProps
) {
  return (sourceProps: TSourceProps): TTargetProps => {
    return converter(sourceProps);
  };
}

/**
 * Merge props with additional className
 */
export function mergePropsWithClassName<T extends { className?: string }>(
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
 * Convert event handlers to standard React patterns
 */
export function convertEventHandlers(handlers: {
  onClick?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  onChange?: (value: any) => void;
}) {
  const { onClick, onOpen, onClose, onChange, ...rest } = handlers;
  
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