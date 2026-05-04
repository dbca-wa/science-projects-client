import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	saveDraftToLocalStorage,
	loadDraftFromLocalStorage,
	clearDraftFromLocalStorage,
	type IDraftState,
} from "./draft-persistence.utils";
import type { ProjectKind } from "@/shared/types/project.types";

/**
 * Helper to create a valid draft state with sensible defaults.
 */
const makeDraft = (overrides: Partial<IDraftState> = {}): IDraftState => ({
	formData: {
		baseInformation: {
			title: "Test Project",
			description: "A test description",
			keywords: ["fauna", "flora"],
			image: null,
		},
		projectDetails: {
			start_date: new Date("2026-03-01T00:00:00.000Z"),
			end_date: new Date("2027-03-01T00:00:00.000Z"),
			business_area: 1,
			project_leader: 10,
			data_custodian: 11,
		},
		location: { areas: [1, 2, 3] },
		externalDetails: null,
		studentDetails: null,
	},
	teamMembers: [
		{
			userId: 10,
			role: "supervising",
			isLeader: true,
			displayName: "Leader User",
			position: 0,
			isStaff: true,
			timeAllocation: 1.0,
		},
		{
			userId: 20,
			role: "research",
			isLeader: false,
			displayName: "Research User",
			position: 1,
			isStaff: true,
			timeAllocation: 0.5,
		},
	],
	currentStep: 2,
	completedSteps: [0, 1],
	projectKind: "science" as ProjectKind,
	savedAt: new Date().toISOString(),
	imageData: null,
	...overrides,
});

describe("draft-persistence.utils — round-trip serialisation", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("should save and load a draft with Date objects restored", () => {
		const draft = makeDraft();
		saveDraftToLocalStorage("science", draft);

		const loaded = loadDraftFromLocalStorage("science");

		expect(loaded).not.toBeNull();
		expect(loaded!.formData.projectDetails.start_date).toBeInstanceOf(Date);
		expect(loaded!.formData.projectDetails.end_date).toBeInstanceOf(Date);
		expect(
			(loaded!.formData.projectDetails.start_date as Date).toISOString()
		).toBe("2026-03-01T00:00:00.000Z");
		expect(
			(loaded!.formData.projectDetails.end_date as Date).toISOString()
		).toBe("2027-03-01T00:00:00.000Z");
	});

	it("should save and load a draft with null image preserved", () => {
		const draft = makeDraft();
		saveDraftToLocalStorage("science", draft);

		const loaded = loadDraftFromLocalStorage("science");

		expect(loaded).not.toBeNull();
		expect(loaded!.formData.baseInformation.image).toBeNull();
	});

	it("should save and load team members correctly", () => {
		const draft = makeDraft();
		saveDraftToLocalStorage("science", draft);

		const loaded = loadDraftFromLocalStorage("science");

		expect(loaded).not.toBeNull();
		expect(loaded!.teamMembers).toHaveLength(2);
		expect(loaded!.teamMembers[0].userId).toBe(10);
		expect(loaded!.teamMembers[0].isLeader).toBe(true);
		expect(loaded!.teamMembers[0].role).toBe("supervising");
		expect(loaded!.teamMembers[1].userId).toBe(20);
		expect(loaded!.teamMembers[1].timeAllocation).toBe(0.5);
	});

	it("should preserve all form data fields through round-trip", () => {
		const draft = makeDraft();
		saveDraftToLocalStorage("science", draft);

		const loaded = loadDraftFromLocalStorage("science");

		expect(loaded).not.toBeNull();
		expect(loaded!.formData.baseInformation.title).toBe("Test Project");
		expect(loaded!.formData.baseInformation.keywords).toEqual([
			"fauna",
			"flora",
		]);
		expect(loaded!.formData.projectDetails.business_area).toBe(1);
		expect(loaded!.formData.location.areas).toEqual([1, 2, 3]);
		expect(loaded!.currentStep).toBe(2);
		expect(loaded!.completedSteps).toEqual([0, 1]);
		expect(loaded!.projectKind).toBe("science");
	});

	it("should handle null date fields", () => {
		const draft = makeDraft({
			formData: {
				...makeDraft().formData,
				projectDetails: {
					...makeDraft().formData.projectDetails,
					start_date: null,
					end_date: null,
				},
			},
		});
		saveDraftToLocalStorage("science", draft);

		const loaded = loadDraftFromLocalStorage("science");

		expect(loaded).not.toBeNull();
		expect(loaded!.formData.projectDetails.start_date).toBeNull();
		expect(loaded!.formData.projectDetails.end_date).toBeNull();
	});
});

describe("draft-persistence.utils — load edge cases", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("should return null when no draft exists in localStorage", () => {
		const loaded = loadDraftFromLocalStorage("science");
		expect(loaded).toBeNull();
	});

	it("should return null when localStorage contains corrupt JSON", () => {
		localStorage.setItem("spms_wizard_draft_science", "not valid json{{{");

		const loaded = loadDraftFromLocalStorage("science");
		expect(loaded).toBeNull();
	});

	it("should return null when localStorage contains valid JSON but wrong shape", () => {
		localStorage.setItem(
			"spms_wizard_draft_science",
			JSON.stringify({ foo: "bar", baz: 123 })
		);

		const loaded = loadDraftFromLocalStorage("science");
		expect(loaded).toBeNull();
	});

	it("should return null when localStorage contains partial draft shape", () => {
		localStorage.setItem(
			"spms_wizard_draft_science",
			JSON.stringify({
				formData: { baseInformation: {} },
				// Missing teamMembers, currentStep, completedSteps, projectKind, savedAt
			})
		);

		const loaded = loadDraftFromLocalStorage("science");
		expect(loaded).toBeNull();
	});
});

describe("draft-persistence.utils — clearDraftFromLocalStorage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("should remove the draft for the given project kind", () => {
		const draft = makeDraft();
		saveDraftToLocalStorage("science", draft);

		expect(localStorage.getItem("spms_wizard_draft_science")).not.toBeNull();

		clearDraftFromLocalStorage("science");

		expect(localStorage.getItem("spms_wizard_draft_science")).toBeNull();
	});

	it("should not affect drafts for other project kinds", () => {
		saveDraftToLocalStorage("science", makeDraft({ projectKind: "science" }));
		saveDraftToLocalStorage("external", makeDraft({ projectKind: "external" }));

		clearDraftFromLocalStorage("science");

		expect(localStorage.getItem("spms_wizard_draft_science")).toBeNull();
		expect(localStorage.getItem("spms_wizard_draft_external")).not.toBeNull();
	});

	it("should not throw when clearing a non-existent draft", () => {
		expect(() => clearDraftFromLocalStorage("science")).not.toThrow();
	});
});

describe("draft-persistence.utils — File object handling", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("should serialise File references as null", () => {
		const file = new File(["content"], "test.png", { type: "image/png" });
		const draft = makeDraft({
			formData: {
				...makeDraft().formData,
				baseInformation: {
					...makeDraft().formData.baseInformation,
					image: file,
				},
			},
		});

		saveDraftToLocalStorage("science", draft);
		const loaded = loadDraftFromLocalStorage("science");

		expect(loaded).not.toBeNull();
		// File cannot be serialised — should be null on restore
		expect(loaded!.formData.baseInformation.image).toBeNull();
	});

	it("should persist and restore imageData (base64) through round-trip", () => {
		const draft = makeDraft({
			imageData: {
				dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
				fileName: "project-photo.png",
			},
		});

		saveDraftToLocalStorage("science", draft);
		const loaded = loadDraftFromLocalStorage("science");

		expect(loaded).not.toBeNull();
		expect(loaded!.imageData).not.toBeNull();
		expect(loaded!.imageData!.dataUrl).toBe(
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=="
		);
		expect(loaded!.imageData!.fileName).toBe("project-photo.png");
	});

	it("should handle null imageData gracefully", () => {
		const draft = makeDraft({ imageData: null });

		saveDraftToLocalStorage("science", draft);
		const loaded = loadDraftFromLocalStorage("science");

		expect(loaded).not.toBeNull();
		expect(loaded!.imageData).toBeNull();
	});
});

describe("draft-persistence.utils — storage key format", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("should use the correct key format for each project kind", () => {
		const kinds: ProjectKind[] = [
			"science",
			"core_function",
			"external",
			"student",
		];

		for (const kind of kinds) {
			saveDraftToLocalStorage(kind, makeDraft({ projectKind: kind }));
			expect(localStorage.getItem(`spms_wizard_draft_${kind}`)).not.toBeNull();
		}
	});
});

describe("draft-persistence.utils — localStorage error handling", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("should not throw when localStorage.setItem fails", () => {
		const spy = vi
			.spyOn(Storage.prototype, "setItem")
			.mockImplementation(() => {
				throw new Error("QuotaExceededError");
			});

		expect(() => saveDraftToLocalStorage("science", makeDraft())).not.toThrow();

		spy.mockRestore();
	});

	it("should not throw when localStorage.getItem fails", () => {
		const spy = vi
			.spyOn(Storage.prototype, "getItem")
			.mockImplementation(() => {
				throw new Error("SecurityError");
			});

		expect(() => loadDraftFromLocalStorage("science")).not.toThrow();
		expect(loadDraftFromLocalStorage("science")).toBeNull();

		spy.mockRestore();
	});
});
