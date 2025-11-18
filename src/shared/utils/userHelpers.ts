/**
 * User-related utility functions
 */

/**
 * Normalizes a user PK to a number
 * Handles both string and number inputs, returns undefined if input is undefined
 * 
 * @param pk - User primary key as number, string, or undefined
 * @returns Normalized number PK or undefined
 * 
 * @example
 * normalizeUserPk(123) // returns 123
 * normalizeUserPk("123") // returns 123
 * normalizeUserPk(undefined) // returns undefined
 */
export const normalizeUserPk = (
  pk: number | string | undefined
): number | undefined => {
  if (pk === undefined) {
    return undefined;
  }

  if (typeof pk === "string") {
    return parseInt(pk, 10);
  }

  return pk;
};

/**
 * Normalizes an entity PK to a number
 * Generic version that works for any entity PK
 * 
 * @param pk - Entity primary key as number, string, or undefined
 * @returns Normalized number PK or undefined
 */
export const normalizePk = normalizeUserPk; // Alias for generic use
