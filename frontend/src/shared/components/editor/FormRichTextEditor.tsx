import { forwardRef, useState, useEffect, useRef } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { WordCounter } from "./WordCounter";
import { inlineEditStore } from "@/app/stores/InlineEditStore";
import type { RichTextEditorProps } from "@/shared/types/editor.types";

export interface FormRichTextEditorProps extends Omit<
	RichTextEditorProps,
	"className"
> {
	wordLimit?: number;
	showWordCounter?: boolean;
	className?: string;
	error?: string;
	label?: string;
	description?: string;
	/** Initial value for dirty tracking — shows amber border when content differs */
	initialValue?: string;
	/** Unique ID for this editor instance (e.g. "about") — required with initialValue */
	editorId?: string;
}

/**
 * FormRichTextEditor
 *
 * Rich text editor for React Hook Form. Visual states match InlineSaveEditor:
 * - Focused: blue border + blue bg on editor area
 * - Dirty (unfocused): amber border + amber bg on editor area
 * - Default: gray border, white bg
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
			floatingToolbar = true,
			disabled = false,
			error,
			label,
			description,
			initialValue,
			editorId,
			className = "",
			...props
		},
		ref
	) => {
		const [linkPanelOpen, setLinkPanelOpen] = useState(false);
		const [isFocused, setIsFocused] = useState(false);
		const containerRef = useRef<HTMLDivElement>(null);

		// Strip HTML for text-only comparison — same as InlineSaveEditor.
		// Avoids false dirty detection from Lexical re-serialising HTML differently on focus.
		const normaliseForComparison = (html: string) =>
			html
				.replace(/<[^>]*>/g, "")
				.replace(/\s+/g, " ")
				.trim();

		// Dirty = text content differs from initial value
		const isDirty =
			initialValue !== undefined && editorId
				? normaliseForComparison(value || "") !==
					normaliseForComparison(initialValue)
				: false;

		// Track focus explicitly — same pattern as InlineSaveEditor
		useEffect(() => {
			const container = containerRef.current;
			if (!container) return;

			const handleFocusIn = () => setIsFocused(true);
			const handleFocusOut = (e: FocusEvent) => {
				if (!container.contains(e.relatedTarget as Node)) {
					setIsFocused(false);
				}
			};

			container.addEventListener("focusin", handleFocusIn);
			container.addEventListener("focusout", handleFocusOut);
			return () => {
				container.removeEventListener("focusin", handleFocusIn);
				container.removeEventListener("focusout", handleFocusOut);
			};
		}, []);

		// Register with InlineEditStore when dirty — enables NavigationBlocker
		useEffect(() => {
			if (!editorId || initialValue === undefined) return;

			if (isDirty) {
				inlineEditStore.registerEditor({
					contentType: editorId as never,
					entityId: 0,
					originalContent: initialValue,
					elementRef: containerRef.current,
				});
				inlineEditStore.updateCurrentContent(editorId as never, 0, value || "");
			} else {
				inlineEditStore.unregisterEditor(editorId as never, 0);
			}

			return () => {
				inlineEditStore.unregisterEditor(editorId as never, 0);
			};
		}, [isDirty, editorId, initialValue, value]);

		// Merge forwarded ref with local containerRef
		const setRefs = (el: HTMLDivElement | null) => {
			containerRef.current = el;
			if (typeof ref === "function") ref(el);
			else if (ref)
				(ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
		};

		// Border + bg classes — matches InlineSaveEditor exactly:
		// focused → blue border, blue bg on whole component
		// dirty (not focused) → amber border + amber bg on whole component
		// default → gray border, white bg
		const containerClass = isFocused
			? "border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20"
			: isDirty
				? "border-2 border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/30"
				: error
					? "border-2 border-red-500 dark:border-red-600"
					: "border-2 border-gray-300 dark:border-gray-600";

		return (
			<div
				ref={setRefs}
				className={`relative rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${containerClass} ${className}`}
			>
				{/* Label/description header */}
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

				{/* Editor area — transparent bg so parent's focus/dirty colour shows through */}
				<div className="transition-colors">
					<RichTextEditor
						value={value}
						onChange={onChange}
						placeholder={placeholder}
						toolbar={toolbar}
						floatingToolbar={floatingToolbar}
						disabled={disabled}
						wordLimit={wordLimit}
						autoFocus={false}
						className="inline-save-editor"
						onLinkPanelChange={setLinkPanelOpen}
						{...props}
					/>
				</div>

				{showWordCounter && !linkPanelOpen && (
					<div className="flex items-center justify-between px-4 pb-4 pt-2">
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
