import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditorStore } from "./editor.store";

vi.mock("@/shared/services/logger.service", () => ({
	logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

describe("EditorStore", () => {
	let store: EditorStore;

	beforeEach(() => {
		store = new EditorStore();
	});

	it("should start with no open editors", () => {
		expect(store.openEditorsCount).toBe(0);
	});

	it("should not have dialog open initially", () => {
		expect(store.isDialogOpen).toBe(false);
	});

	it("should not have pending action initially", () => {
		expect(store.pendingAction).toBeNull();
	});

	it("openEditor should increment open editors count", () => {
		store.openEditor();
		expect(store.openEditorsCount).toBe(1);
	});

	it("closeEditor should decrement open editors count", () => {
		store.openEditor();
		store.openEditor();
		store.closeEditor();
		expect(store.openEditorsCount).toBe(1);
	});

	it("closeEditor should not go below 0", () => {
		store.closeEditor();
		expect(store.openEditorsCount).toBe(0);
	});

	it("setDialogOpen should update dialog state", () => {
		store.setDialogOpen(true);
		expect(store.isDialogOpen).toBe(true);
		store.setDialogOpen(false);
		expect(store.isDialogOpen).toBe(false);
	});

	it("setPendingAction should store the action", () => {
		const action = vi.fn();
		store.setPendingAction(action);
		expect(store.pendingAction).not.toBeNull();
		expect(typeof store.pendingAction).toBe("function");
	});

	it("setPendingAction with null should clear the action", () => {
		store.setPendingAction(vi.fn());
		store.setPendingAction(null);
		expect(store.pendingAction).toBeNull();
	});

	it("reset should clear all state", () => {
		store.openEditor();
		store.setDialogOpen(true);
		store.setPendingAction(vi.fn());
		store.reset();
		expect(store.openEditorsCount).toBe(0);
		expect(store.isDialogOpen).toBe(false);
		expect(store.pendingAction).toBeNull();
	});

	it("shouldBlockNavigation should return false when no editors open", () => {
		expect(store.shouldBlockNavigation("/a", "/b")).toBe(false);
	});

	it("shouldBlockNavigation should return true when editors are open", () => {
		store.openEditor();
		expect(store.shouldBlockNavigation("/a", "/b")).toBe(true);
	});

	it("shouldBlockNavigation should return false for same path", () => {
		store.openEditor();
		expect(store.shouldBlockNavigation("/a", "/a")).toBe(false);
	});
});
