/**
 * Navigation utilities for handling Ctrl+Click and cross-platform navigation
 */

/**
 * Platform detection utility
 * Returns the appropriate modifier key for the current platform
 */
export const getPlatformModifierKey = (): 'ctrlKey' | 'metaKey' => {
  try {
    const platform = navigator.platform?.toLowerCase() || '';
    return platform.includes('mac') ? 'metaKey' : 'ctrlKey';
  } catch (error) {
    console.warn('Platform detection failed, defaulting to ctrlKey:', error);
    return 'ctrlKey';
  }
};

/**
 * Modifier key detection
 * Checks if the appropriate modifier key is pressed for the current platform
 */
export const hasModifierKey = (event: MouseEvent | KeyboardEvent): boolean => {
  const modifierKey = getPlatformModifierKey();
  return event[modifierKey] === true;
};