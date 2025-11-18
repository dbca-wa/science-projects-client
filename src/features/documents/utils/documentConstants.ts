/**
 * Document and endorsement constants
 */

import { FaShieldDog } from "react-icons/fa6";
import type { IconType } from "react-icons";

/**
 * Endorsement kind types
 * Currently only AEC is used (others removed on Directorate request)
 */
export type EndorsementKind = "aec";

/**
 * Endorsement kind metadata
 */
export interface EndorsementKindMetadata {
  color: string;
  string: string;
  icon: IconType;
  todoDescription: string;
}

/**
 * Endorsement kind dictionary with metadata
 * Used across the application for consistent endorsement type display
 */
export const ENDORSEMENT_KIND_DICT: Record<EndorsementKind, EndorsementKindMetadata> = {
  aec: {
    color: "blue",
    string: "AEC",
    icon: FaShieldDog,
    todoDescription:
      "Upload the Animal Ethics Committee Approval form (PDF) to provide AEC approval",
  },
};

/**
 * Get endorsement kind metadata by kind
 */
export const getEndorsementKindMetadata = (kind: EndorsementKind): EndorsementKindMetadata => {
  return ENDORSEMENT_KIND_DICT[kind];
};

/**
 * Get endorsement kind color
 */
export const getEndorsementKindColor = (kind: EndorsementKind): string => {
  return ENDORSEMENT_KIND_DICT[kind].color;
};

/**
 * Get endorsement kind display string
 */
export const getEndorsementKindString = (kind: EndorsementKind): string => {
  return ENDORSEMENT_KIND_DICT[kind].string;
};

/**
 * Get endorsement kind icon
 */
export const getEndorsementKindIcon = (kind: EndorsementKind): IconType => {
  return ENDORSEMENT_KIND_DICT[kind].icon;
};

/**
 * Get endorsement kind todo description
 */
export const getEndorsementKindTodoDescription = (kind: EndorsementKind): string => {
  return ENDORSEMENT_KIND_DICT[kind].todoDescription;
};
