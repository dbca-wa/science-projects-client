/**
 * Project constants and type definitions
 */

import { FaUserFriends } from "react-icons/fa";
import { GiMaterialsScience } from "react-icons/gi";
import { MdScience } from "react-icons/md";
import { RiBook3Fill } from "react-icons/ri";
import type { IconType } from "react-icons";

/**
 * Project kind types
 */
export type ProjectKind = "core_function" | "science" | "student" | "external";

/**
 * Project kind metadata
 */
export interface ProjectKindMetadata {
  color: string;
  string: string;
  tag: string;
  icon: IconType;
}

/**
 * Project kind dictionary with metadata for each project type
 * Used across the application for consistent project type display
 */
export const PROJECT_KIND_DICT: Record<ProjectKind, ProjectKindMetadata> = {
  core_function: {
    color: "red",
    string: "Core Function",
    tag: "CF",
    icon: GiMaterialsScience,
  },
  science: {
    color: "green",
    string: "Science",
    tag: "SP",
    icon: MdScience,
  },
  student: {
    color: "blue",
    string: "Student",
    tag: "STP",
    icon: RiBook3Fill,
  },
  external: {
    color: "gray",
    string: "External",
    tag: "EXT",
    icon: FaUserFriends,
  },
};

/**
 * Get project kind metadata by kind
 */
export const getProjectKindMetadata = (kind: ProjectKind): ProjectKindMetadata => {
  return PROJECT_KIND_DICT[kind];
};

/**
 * Get project kind color
 */
export const getProjectKindColor = (kind: ProjectKind): string => {
  return PROJECT_KIND_DICT[kind].color;
};

/**
 * Get project kind display string
 */
export const getProjectKindString = (kind: ProjectKind): string => {
  return PROJECT_KIND_DICT[kind].string;
};

/**
 * Get project kind tag
 */
export const getProjectKindTag = (kind: ProjectKind): string => {
  return PROJECT_KIND_DICT[kind].tag;
};

/**
 * Get project kind icon
 */
export const getProjectKindIcon = (kind: ProjectKind): IconType => {
  return PROJECT_KIND_DICT[kind].icon;
};
