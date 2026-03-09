/**
 * Lexical theme configuration for comment editor
 *
 * Defines CSS classes for Lexical nodes and formatting in comments.
 */
export const COMMENT_THEME = {
	paragraph: "mb-2",
	text: {
		bold: "font-bold",
		italic: "italic",
		underline: "underline",
	},
	list: {
		ul: "list-disc list-inside mb-2",
		ol: "list-decimal list-inside mb-2",
		listitem: "ml-4",
	},
	mention: "text-blue-600 hover:underline cursor-pointer font-medium",
};
