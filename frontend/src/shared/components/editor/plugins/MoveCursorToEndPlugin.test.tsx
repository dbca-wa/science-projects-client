// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Test file with complex type issues requiring refactor
// @ts-nocheck
/**
 * MoveCursorToEndPlugin Bug Condition Exploration Test
 *
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 *
 * Bug: MoveCursorToEndPlugin fails to position cursor at end when editor opens,
 * requiring users to click again before typing.
 *
 * Expected counterexamples:
 * - Cursor is not positioned at end when editor becomes editable
 * - User cannot type immediately without additional click
 * - Plugin executes but cursor position is incorrect
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getRoot,
	$getSelection,
	type RangeSelection,
	type EditorState,
	type LexicalEditor,
} from "lexical";
import { MoveCursorToEndPlugin } from "./MoveCursorToEndPlugin";
import { PrepopulateHTMLPlugin } from "./PrepopulateHTMLPlugin";

// Test component to access editor state
function EditorStateReader({
	onStateRead,
}: {
	onStateRead: (state: EditorState) => void;
}) {
	const [editor] = useLexicalComposerContext();

	editor.registerUpdateListener(({ editorState }) => {
		editorState.read(() => {
			const root = $getRoot();
			const selection = $getSelection();

			const textContent = root.getTextContent();
			const hasSelection = selection !== null;
			const isCollapsed =
				selection !== null &&
				"isCollapsed" in selection &&
				selection.isCollapsed();

			// Try to determine if cursor is at end
			let cursorAtEnd = false;
			if (selection !== null && "anchor" in selection && "focus" in selection) {
				const anchor = selection.anchor;
				const focus = selection.focus;
				cursorAtEnd =
					anchor.offset === textContent.length &&
					focus.offset === textContent.length;
			}

			onStateRead({
				textContent,
				hasSelection,
				isCollapsed,
				cursorAtEnd,
			});
		});
	});

	return null;
}

// Helper to check if cursor is at end (no longer needed, kept for reference)
function _isCursorAtEnd(
	selection: RangeSelection,
	textContent: string
): boolean {
	if (!selection) return false;

	const anchor = selection.anchor;
	const focus = selection.focus;

	// Check if selection is collapsed (cursor, not range)
	if (!selection.isCollapsed()) return false;

	// Get the text length
	const textLength = textContent.length;

	// Check if cursor is at the end
	return anchor.offset === textLength && focus.offset === textLength;
}

describe("MoveCursorToEndPlugin - Bug Condition Exploration", () => {
	let stateHistory: EditorState[] = [];

	beforeEach(() => {
		stateHistory = [];
		vi.clearAllMocks();
	});

	const initialConfig = {
		namespace: "TestEditor",
		theme: {},
		onError: (error: Error) => console.error(error),
		editable: true,
	};

	/**
	 * Test 1: Cursor positioning with pre-populated content
	 *
	 * EXPECTED TO FAIL: Cursor is NOT at end when editor opens with content
	 */
	it("should position cursor at end when editor opens with pre-populated content", async () => {
		const initialContent =
			"<p>This is some initial content that should have cursor at end.</p>";

		const { container: _container } = render(
			<LexicalComposer initialConfig={initialConfig}>
				<RichTextPlugin
					contentEditable={<ContentEditable />}
					placeholder={<div>Enter text...</div>}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<PrepopulateHTMLPlugin html={initialContent} />
				<MoveCursorToEndPlugin />
				<EditorStateReader onStateRead={(state) => stateHistory.push(state)} />
			</LexicalComposer>
		);

		// Wait for plugin to execute
		await waitFor(
			() => {
				expect(stateHistory.length).toBeGreaterThan(0);
			},
			{ timeout: 500 }
		);

		// Get the final state after plugin execution
		const finalState = stateHistory[stateHistory.length - 1];

		// BUG CONDITION: Cursor should be at end but likely is NOT
		// This assertion SHOULD FAIL on unfixed code
		expect(finalState.cursorAtEnd).toBe(true);
		expect(finalState.hasSelection).toBe(true);
		expect(finalState.isCollapsed).toBe(true);

		// Document counterexample if test fails
		if (!finalState.cursorAtEnd) {
			console.log("COUNTEREXAMPLE FOUND:");
			console.log("- Text content:", finalState.textContent);
			console.log("- Cursor at end:", finalState.cursorAtEnd);
			console.log("- Selection type:", finalState.selection?.getType());
			console.log("- This confirms the bug: cursor is NOT positioned at end");
		}
	});

	/**
	 * Test 2: Cursor positioning with empty content
	 *
	 * EXPECTED TO FAIL: Cursor may not be positioned correctly even with empty content
	 */
	it("should position cursor correctly when editor opens with empty content", async () => {
		const { container: _container2 } = render(
			<LexicalComposer initialConfig={initialConfig}>
				<RichTextPlugin
					contentEditable={<ContentEditable />}
					placeholder={<div>Enter text...</div>}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<MoveCursorToEndPlugin />
				<EditorStateReader onStateRead={(state) => stateHistory.push(state)} />
			</LexicalComposer>
		);

		// Wait for plugin to execute
		await waitFor(
			() => {
				expect(stateHistory.length).toBeGreaterThan(0);
			},
			{ timeout: 500 }
		);

		const finalState = stateHistory[stateHistory.length - 1];

		// Even with empty content, cursor should be positioned
		expect(finalState.hasSelection).toBe(true);
		expect(finalState.isCollapsed).toBe(true);

		if (!finalState.hasSelection) {
			console.log("COUNTEREXAMPLE FOUND:");
			console.log("- Selection exists:", finalState.hasSelection);
			console.log("- This confirms the bug: cursor is not properly positioned");
		}
	});

	/**
	 * Test 3: Timing issue - cursor positioning before content loads
	 *
	 * EXPECTED TO FAIL: 100ms delay may not be sufficient for content to load
	 */
	it("should wait for content to load before positioning cursor", async () => {
		const longContent = "<p>" + "Long content ".repeat(50) + "</p>";

		const { container: _container3 } = render(
			<LexicalComposer initialConfig={initialConfig}>
				<RichTextPlugin
					contentEditable={<ContentEditable />}
					placeholder={<div>Enter text...</div>}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<PrepopulateHTMLPlugin html={longContent} />
				<MoveCursorToEndPlugin />
				<EditorStateReader onStateRead={(state) => stateHistory.push(state)} />
			</LexicalComposer>
		);

		// Wait longer to see if cursor eventually positions correctly
		await waitFor(
			() => {
				expect(stateHistory.length).toBeGreaterThan(0);
			},
			{ timeout: 1000 }
		);

		const finalState = stateHistory[stateHistory.length - 1];

		// BUG CONDITION: With long content, timing issue is more pronounced
		expect(finalState.cursorAtEnd).toBe(true);

		if (!finalState.cursorAtEnd) {
			console.log("COUNTEREXAMPLE FOUND:");
			console.log("- Content length:", finalState.textContent.length);
			console.log("- Cursor at end:", finalState.cursorAtEnd);
			console.log(
				"- This confirms timing issue: content loads but cursor not positioned"
			);
		}
	});

	/**
	 * Test 4: User cannot type immediately
	 *
	 * EXPECTED TO FAIL: Without proper cursor positioning, typing may not work
	 */
	it("should allow immediate typing without additional click", async () => {
		const initialContent = "<p>Initial content</p>";
		const editorRef = { current: null as LexicalEditor | null };

		function EditorCapture() {
			const [editor] = useLexicalComposerContext();
			// eslint-disable-next-line react-hooks/immutability -- Test utility component capturing editor reference
			editorRef.current = editor;
			return null;
		}

		const { container: _container4 } = render(
			<LexicalComposer initialConfig={initialConfig}>
				<RichTextPlugin
					contentEditable={<ContentEditable />}
					placeholder={<div>Enter text...</div>}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<PrepopulateHTMLPlugin html={initialContent} />
				<MoveCursorToEndPlugin />
				<EditorCapture />
				<EditorStateReader onStateRead={(state) => stateHistory.push(state)} />
			</LexicalComposer>
		);

		// Wait for plugin to execute
		await waitFor(
			() => {
				expect(stateHistory.length).toBeGreaterThan(0);
			},
			{ timeout: 500 }
		);

		// Try to insert text programmatically (simulating typing)
		let insertSucceeded = false;
		if (editorRef.current) {
			editorRef.current.update(() => {
				const selection = $getSelection();
				if (selection) {
					selection.insertText(" typed text");
					insertSucceeded = true;
				}
			});
		}

		// BUG CONDITION: Text insertion should succeed but may not
		expect(insertSucceeded).toBe(true);

		if (!insertSucceeded) {
			console.log("COUNTEREXAMPLE FOUND:");
			console.log("- Could not insert text");
			console.log("- This confirms the bug: user cannot type immediately");
		}
	});
});
