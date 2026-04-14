import { forwardRef, useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { WordCounter } from "./WordCounter";
import type { RichTextEditorProps } from "@/shared/types/editor.types";

export interface FormRichTextEditorProps extends Omit<
	RichTextEditorProps,
	"className"
> {
	/**
	 * Word limit for the editor content
	 */
	wordLimit?: number;

	/**
	 * Whether to show the word limit counter
	 */
	showWordCounter?: boolean;

	/**
	 * Additional CSS classes for the container
	 */
	className?: string;

	/**
	 * Error message to display
	 */
	error?: string;

	/**
	 * Optional label to display inside the editor border
	 * When provided, creates an integrated label-editor design
	 */
	label?: string;

	/**
	 * Optional description text to display below the label
	 */
	description?: string;
}

/**
 * FormRichTextEditor component
 *
 * Rich text editor designed for React Hook Form integration.
 * Matches the visual design of InlineSaveEditor with borders, focus states, and padding.
 *
 * Features:
 * - Consistent visual design with InlineSaveEditor
 * - Word limit enforcement with counter
 * - Focus state styling
 * - Error state display
 * - Full toolbar with formatting options
 * - Accessible ARIA labels
 * - Optional integrated label and description
 *
 * Usage Patterns:
 *
 * 1. With external FormLabel (traditional React Hook Form pattern):
 * ```tsx
 * <FormField
 *   control={form.control}
 *   name="about"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormLabel>About</FormLabel>
 *       <FormControl>
 *         <FormRichTextEditor
 *           value={field.value || ""}
 *           onChange={field.onChange}
 *           placeholder="Tell us about yourself..."
 *           wordLimit={500}
 *         />
 *       </FormControl>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 * ```
 *
 * 2. With integrated label (cleaner, more cohesive design):
 * ```tsx
 * <FormField
 *   control={form.control}
 *   name="about"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormControl>
 *         <FormRichTextEditor
 *           label="About"
 *           description="Tell us about yourself and your background"
 *           value={field.value || ""}
 *           onChange={field.onChange}
 *           placeholder="Start typing..."
 *           wordLimit={500}
 *         />
 *       </FormControl>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 * ```
 */
export const FormRichTextEditor = forwardRef<
	HTMLDivElement,
	FormRichTextEditorProps
>(
	(
		{
			value,
			onChange,
			placeholder,
			wordLimit,
			showWordCounter = !!wordLimit,
			toolbar = "full",
			disabled = false,
			error,
			label,
			description,
			className = "",
			...props
		},
		ref
	) => {
		const [linkPanelOpen, setLinkPanelOpen] = useState(false);

		return (
			<div
				ref={ref}
				className={`relative rounded-lg border-2 border-gray-300 dark:border-gray-600
          focus-within:border-blue-500 focus-within:bg-blue-50 dark:focus-within:bg-blue-950/20
          transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 ${
						error ? "border-red-500 dark:border-red-600" : ""
					} ${className}`}
			>
				{/* Integrated label and description */}
				{(label || description) && (
					<div className="px-4 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
						{label && (
							<label className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
								{label}
							</label>
						)}
						{description && (
							<p className="text-sm text-muted-foreground mt-1">
								{description}
							</p>
						)}
					</div>
				)}

				<RichTextEditor
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					toolbar={toolbar}
					disabled={disabled}
					wordLimit={wordLimit}
					autoFocus={false}
					className="bg-transparent"
					onLinkPanelChange={setLinkPanelOpen}
					{...props}
				/>

				{showWordCounter && !linkPanelOpen && (
					<div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
						<WordCounter
							content={value || ""}
							limit={wordLimit}
							showLimit={!!wordLimit}
						/>
					</div>
				)}
			</div>
		);
	}
);

FormRichTextEditor.displayName = "FormRichTextEditor";
