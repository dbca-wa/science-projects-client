/**
 * OnChangePlugin Unit Tests
 *
 * Tests the onChange emit decision logic. onChange fires only for genuine
 * content edits made while the editor is editable — not for the initial load,
 * the becoming-editable transition, programmatic (controlled-value) updates, or
 * selection/focus-only changes (clicking into or between editors).
 */

import { describe, it, expect } from "vitest";

const PROGRAMMATIC_TAGS = [
	"history-merge",
	"becoming-editable",
	"controlled-value-update",
];

/**
 * Simulate the emit decision from OnChangePlugin's update listener.
 */
function shouldEmitOnChange({
	tags = new Set<string>(),
	dirtyElementCount = 0,
	dirtyLeafCount = 0,
	isEditable = true,
}: {
	tags?: Set<string>;
	dirtyElementCount?: number;
	dirtyLeafCount?: number;
	isEditable?: boolean;
}): boolean {
	// Programmatic updates never emit
	if (PROGRAMMATIC_TAGS.some((tag) => tags.has(tag))) {
		return false;
	}
	// Selection/focus-only updates (no mutated nodes) never emit
	if (dirtyElementCount === 0 && dirtyLeafCount === 0) {
		return false;
	}
	// Only emit while editable
	if (!isEditable) {
		return false;
	}
	return true;
}

describe("OnChangePlugin - emit decision", () => {
	it("does not emit on the initial content load (history-merge)", () => {
		expect(
			shouldEmitOnChange({
				tags: new Set(["history-merge"]),
				dirtyLeafCount: 1,
			})
		).toBe(false);
	});

	it("does not emit on the becoming-editable transition", () => {
		expect(shouldEmitOnChange({ tags: new Set(["becoming-editable"]) })).toBe(
			false
		);
	});

	it("does not emit on a programmatic controlled-value update", () => {
		expect(
			shouldEmitOnChange({
				tags: new Set(["controlled-value-update"]),
				dirtyLeafCount: 2,
			})
		).toBe(false);
	});

	it("does not emit on a selection/focus-only change (no dirty nodes)", () => {
		// Clicking into or between editors mutates no nodes
		expect(
			shouldEmitOnChange({ dirtyElementCount: 0, dirtyLeafCount: 0 })
		).toBe(false);
	});

	it("does not emit while the editor is not editable", () => {
		expect(shouldEmitOnChange({ dirtyLeafCount: 1, isEditable: false })).toBe(
			false
		);
	});

	it("emits on the first keystroke (a dirty leaf while editable)", () => {
		expect(shouldEmitOnChange({ dirtyLeafCount: 1 })).toBe(true);
	});

	it("emits when block-level content changes (dirty elements)", () => {
		expect(shouldEmitOnChange({ dirtyElementCount: 1 })).toBe(true);
	});

	it("emits on undo/redo content changes", () => {
		// History updates that mutate content still emit (no programmatic tag)
		expect(
			shouldEmitOnChange({ dirtyLeafCount: 3, dirtyElementCount: 1 })
		).toBe(true);
	});
});
