/**
 * Declarative toolbar mode configurations.
 *
 * Single source of truth for what each editor mode allows.
 * Used by Toolbar.tsx (button visibility), PastePlugin.tsx (paste stripping),
 * and RichTextEditor.tsx (node registration via getNodesForMode).
 */

import type { ToolbarMode } from "@/shared/types/editor.types";

export interface ToolbarConfig {
	/** Human-readable description of when to use this mode */
	description: string;
	formatting: {
		bold: boolean;
		italic: boolean;
		underline: boolean;
		strikethrough: boolean;
		subscript: boolean;
		superscript: boolean;
	};
	blocks: {
		headings: boolean;
		lists: boolean;
		tables: boolean;
	};
	features: {
		links: boolean;
		images: boolean;
		clearFormatting: boolean;
		indentOutdent: boolean;
		alignment: boolean;
	};
}

/**
 * Declarative configuration for each toolbar mode.
 *
 * Adding or modifying editor behaviour requires only changing this object.
 * Toolbar.tsx, PastePlugin.tsx, and RichTextEditor.tsx all derive their
 * behaviour from these entries.
 */
export const TOOLBAR_CONFIGS: Record<ToolbarMode, ToolbarConfig> = {
	/**
	 * Full toolbar — backward-compatible alias for "document".
	 * Kept for existing usages; new code should prefer "document".
	 * Used for concept plan, project plan, and project closure fields.
	 */
	full: {
		description:
			"Full formatting toolbar for document fields (concept plan, project plan, project closure). Alias for 'document' — kept for backward compatibility.",
		formatting: {
			bold: true,
			italic: true,
			underline: true,
			strikethrough: false,
			subscript: true,
			superscript: true,
		},
		blocks: {
			headings: true,
			lists: true,
			tables: true,
		},
		features: {
			links: true,
			images: false,
			clearFormatting: true,
			indentOutdent: true,
			alignment: true,
		},
	},

	/**
	 * Document toolbar — primary mode for structured document fields.
	 * Includes all formatting except images.
	 * Used for concept plan, project plan, and project closure fields.
	 */
	document: {
		description:
			"Primary mode for structured document fields (concept plan, project plan, project closure). All formatting except images.",
		formatting: {
			bold: true,
			italic: true,
			underline: true,
			strikethrough: false,
			subscript: true,
			superscript: true,
		},
		blocks: {
			headings: true,
			lists: true,
			tables: true,
		},
		features: {
			links: true,
			images: false,
			clearFormatting: true,
			indentOutdent: true,
			alignment: true,
		},
	},

	/**
	 * Report toolbar — for progress report and student report fields.
	 * Allows inline formatting and lists but no tables or links.
	 */
	report: {
		description:
			"Report fields (progress report, student report). Inline formatting and lists, no tables or links.",
		formatting: {
			bold: true,
			italic: true,
			underline: true,
			strikethrough: false,
			subscript: true,
			superscript: true,
		},
		blocks: {
			headings: false,
			lists: true,
			tables: false,
		},
		features: {
			links: false,
			images: false,
			clearFormatting: true,
			indentOutdent: false,
			alignment: false,
		},
	},

	/**
	 * Simple toolbar — for overview description and aims fields.
	 * Bold, italic, and lists only. No underline, subscript/superscript, tables, or links.
	 */
	simple: {
		description:
			"Overview fields (project description, external aims). Bold, italic, and lists only.",
		formatting: {
			bold: true,
			italic: true,
			underline: false,
			strikethrough: false,
			subscript: false,
			superscript: false,
		},
		blocks: {
			headings: false,
			lists: true,
			tables: false,
		},
		features: {
			links: false,
			images: false,
			clearFormatting: false,
			indentOutdent: false,
			alignment: false,
		},
	},

	/**
	 * Minimal toolbar — for feedback and comment editors.
	 * Bold and italic only. No lists, tables, links, or underline.
	 */
	minimal: {
		description:
			"Feedback and comment editors. Bold and italic only — no other formatting.",
		formatting: {
			bold: true,
			italic: true,
			underline: false,
			strikethrough: false,
			subscript: false,
			superscript: false,
		},
		blocks: {
			headings: false,
			lists: false,
			tables: false,
		},
		features: {
			links: false,
			images: false,
			clearFormatting: false,
			indentOutdent: false,
			alignment: false,
		},
	},

	/**
	 * Profile toolbar — for user profile about and expertise fields.
	 * Inline formatting with lists and links, but no tables or headings.
	 */
	profile: {
		description:
			"User profile fields (about, expertise). Inline formatting with lists and links, no tables or headings.",
		formatting: {
			bold: true,
			italic: true,
			underline: true,
			strikethrough: false,
			subscript: true,
			superscript: true,
		},
		blocks: {
			headings: false,
			lists: true,
			tables: false,
		},
		features: {
			links: true,
			images: false,
			clearFormatting: true,
			indentOutdent: false,
			alignment: false,
		},
	},

	/**
	 * Business area toolbar — for BA introduction and focus fields.
	 * Inline formatting with subscript/superscript and clear formatting.
	 * No lists, tables, or links.
	 */
	businessArea: {
		description:
			"Business area fields (introduction, focus). Inline formatting only — no lists, tables, or links.",
		formatting: {
			bold: true,
			italic: true,
			underline: true,
			strikethrough: false,
			subscript: true,
			superscript: true,
		},
		blocks: {
			headings: false,
			lists: false,
			tables: false,
		},
		features: {
			links: false,
			images: false,
			clearFormatting: true,
			indentOutdent: false,
			alignment: false,
		},
	},

	/**
	 * New cycle toolbar — for the new cycle email body editor.
	 * Bold, italic, underline, and lists. No subscript/superscript, tables, or links.
	 */
	newCycle: {
		description:
			"New cycle email body editor. Bold, italic, underline, and lists — no subscript/superscript, tables, or links.",
		formatting: {
			bold: true,
			italic: true,
			underline: true,
			strikethrough: false,
			subscript: false,
			superscript: false,
		},
		blocks: {
			headings: false,
			lists: true,
			tables: false,
		},
		features: {
			links: false,
			images: false,
			clearFormatting: false,
			indentOutdent: false,
			alignment: false,
		},
	},

	/**
	 * Guide toolbar — for knowledge base guide editor.
	 * Same as full/document but WITH images.
	 */
	guide: {
		description:
			"Knowledge base guide editor. Full formatting including images.",
		formatting: {
			bold: true,
			italic: true,
			underline: true,
			strikethrough: false,
			subscript: true,
			superscript: true,
		},
		blocks: {
			headings: true,
			lists: true,
			tables: true,
		},
		features: {
			links: true,
			images: true,
			clearFormatting: true,
			indentOutdent: true,
			alignment: true,
		},
	},

	/**
	 * No toolbar — used when the editor is read-only or no toolbar is needed.
	 * No toolbar is rendered; no formatting restrictions applied.
	 */
	none: {
		description:
			"No toolbar rendered. Used for read-only editors or when no toolbar is needed.",
		formatting: {
			bold: false,
			italic: false,
			underline: false,
			strikethrough: false,
			subscript: false,
			superscript: false,
		},
		blocks: {
			headings: false,
			lists: false,
			tables: false,
		},
		features: {
			links: false,
			images: false,
			clearFormatting: false,
			indentOutdent: false,
			alignment: false,
		},
	},
};
