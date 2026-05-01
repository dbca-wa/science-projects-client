import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditProjectStore } from "./edit-project.store";

vi.mock("@/shared/services/logger.service", () => ({
	logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

vi.mock("@/shared/utils/image.utils", () => ({
	getImageUrl: (img: { file?: string } | null) => img?.file ?? null,
}));

describe("EditProjectStore", () => {
	let store: EditProjectStore;

	beforeEach(() => {
		store = new EditProjectStore();
	});

	describe("initial state", () => {
		it("should have null projectId", () => {
			expect(store.state.projectId).toBeNull();
		});

		it("should have empty form data", () => {
			expect(store.state.formData.title).toBe("");
		});

		it("should not be initialised", () => {
			expect(store.state.initialised).toBe(false);
		});

		it("should not be dirty", () => {
			expect(store.isDirty).toBe(false);
		});
	});

	describe("updateFormData", () => {
		it("should update form fields", () => {
			store.updateFormData({ title: "Updated Title" });
			expect(store.state.formData.title).toBe("Updated Title");
		});

		it("should merge with existing data", () => {
			store.updateFormData({ title: "Title" });
			store.updateFormData({ description: "Desc" });
			expect(store.state.formData.title).toBe("Title");
			expect(store.state.formData.description).toBe("Desc");
		});
	});

	describe("setActiveTab", () => {
		it("should set active tab", () => {
			store.setActiveTab("project-areas");
			expect(store.state.activeTab).toBe("project-areas");
		});
	});

	describe("setSubmitting", () => {
		it("should set submitting state", () => {
			store.setSubmitting(true);
			expect(store.state.isSubmitting).toBe(true);
		});
	});

	describe("isDirty computed", () => {
		it("should be false when no original data loaded", () => {
			expect(store.isDirty).toBe(false);
		});

		it("should be true when form data differs from original", () => {
			// Simulate loading a project
			store.state.originalData = { ...store.state.formData };
			store.state.formData = { ...store.state.formData, title: "Changed" };
			expect(store.isDirty).toBe(true);
		});

		it("should be false when form data matches original", () => {
			store.state.originalData = { ...store.state.formData };
			expect(store.isDirty).toBe(false);
		});
	});

	describe("isValid computed", () => {
		it("should be false with empty required fields", () => {
			expect(store.isValid).toBe(false);
		});

		it("should be true with required fields filled", () => {
			store.updateFormData({
				title: "Test Project",
				business_area: 1,
				start_date: "2026-01-01",
			});
			expect(store.isValid).toBe(true);
		});

		it("should be false when end date is before start date", () => {
			store.updateFormData({
				title: "Test",
				business_area: 1,
				start_date: "2026-06-01",
				end_date: "2026-01-01",
			});
			expect(store.isValid).toBe(false);
		});
	});

	describe("changedFields computed", () => {
		it("should return empty array when no original data", () => {
			expect(store.changedFields).toEqual([]);
		});

		it("should return changed field names", () => {
			store.state.originalData = { ...store.state.formData };
			store.state.formData = {
				...store.state.formData,
				title: "Changed",
				description: "New",
			};
			expect(store.changedFields).toContain("title");
			expect(store.changedFields).toContain("description");
		});
	});

	describe("discardChanges", () => {
		it("should reset form data to original", () => {
			store.state.originalData = { ...store.state.formData, title: "Original" };
			store.state.formData = { ...store.state.formData, title: "Changed" };
			store.discardChanges();
			expect(store.state.formData.title).toBe("Original");
		});
	});

	describe("reset", () => {
		it("should reset all state", () => {
			store.updateFormData({ title: "Test" });
			store.setActiveTab("project-areas");
			store.setSubmitting(true);
			store.reset();
			expect(store.state.projectId).toBeNull();
			expect(store.state.formData.title).toBe("");
			expect(store.state.activeTab).toBe("basic-info");
			expect(store.state.isSubmitting).toBe(false);
		});
	});
});
