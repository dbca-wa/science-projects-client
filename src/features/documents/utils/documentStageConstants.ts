/**
 * Document stage constants for workflow stages
 */

import {
  TbCircleNumber1Filled,
  TbCircleNumber2Filled,
  TbCircleNumber3Filled,
} from "react-icons/tb";
import type { IconType } from "react-icons";

/**
 * Document stage types
 */
export type DocumentStage = 1 | 2 | 3;

/**
 * Document stage metadata
 */
export interface DocumentStageMetadata {
  number: number;
  icon: IconType;
  label: string;
}

/**
 * Document stage dictionary with metadata
 * Used for displaying document workflow stages
 */
export const DOCUMENT_STAGE_DICT: Record<DocumentStage, DocumentStageMetadata> = {
  1: {
    number: 1,
    icon: TbCircleNumber1Filled,
    label: "Stage 1",
  },
  2: {
    number: 2,
    icon: TbCircleNumber2Filled,
    label: "Stage 2",
  },
  3: {
    number: 3,
    icon: TbCircleNumber3Filled,
    label: "Stage 3",
  },
};

/**
 * Get document stage metadata by stage number
 */
export const getDocumentStageMetadata = (stage: DocumentStage): DocumentStageMetadata => {
  return DOCUMENT_STAGE_DICT[stage];
};

/**
 * Get document stage icon
 */
export const getDocumentStageIcon = (stage: DocumentStage): IconType => {
  return DOCUMENT_STAGE_DICT[stage].icon;
};

/**
 * Get document stage label
 */
export const getDocumentStageLabel = (stage: DocumentStage): string => {
  return DOCUMENT_STAGE_DICT[stage].label;
};
