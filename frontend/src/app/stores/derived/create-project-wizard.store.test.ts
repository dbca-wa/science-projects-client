import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/shared/services/logger.service", () => ({
	logger: { info: vi.fn(), warn: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

import { CreateProjectWizardStore } from "./create-project-wizard.store";

describe("CreateProjectWizardStore", () => {
	let store: CreateProjectWizardStore;

	beforeEach(() => {
		sessionStorage.clear();
		store = new CreateProjectWizardStore();
	});

	describe("initial state", () => {
		it("should start at step 0", () => {
			expect(store.state.currentStep).toBe(0);
		});

		it("should not be submitting", () => {
			expect(store.state.isSubmitting).toBe(false);
		});

		it("should have empty form data", () => {
			expect(store.state.formData.title).toBe("");
		});
	});

	describe("step navigation", () => {
		it("nextStep should advance when current step is valid", () => {
			store.setProjectKind("science");
			store.setStepValidation(0, true);
			store.nextStep();
			expect(store.state.currentStep).toBe(1);
		});

		it("nextStep should not advance when current step is invalid", () => {
			store.setProjectKind("science");
			store.nextStep();
			expect(store.state.currentStep).toBe(0);
		});

		it("previousStep should go back", () => {
			store.setProjectKind("science");
			store.setStepValidation(0, true);
			store.nextStep();
			store.previousStep();
			expect(store.state.currentStep).toBe(0);
		});

		it("previousStep should not go below 0", () => {
			store.previousStep();
			expect(store.state.currentStep).toBe(0);
		});

		it("canGoForward should be false when invalid", () => {
			store.setProjectKind("science");
			expect(store.canGoForward).toBe(false);
		});

		it("canGoBack should be false at step 0", () => {
			expect(store.canGoBack).toBe(false);
		});

		it("canGoBack should be true at step 1+", () => {
			store.setProjectKind("science");
			store.setStepValidation(0, true);
			store.nextStep();
			expect(store.canGoBack).toBe(true);
		});
	});

	describe("project kind", () => {
		it("should have 3 steps for science projects", () => {
			store.setProjectKind("science");
			expect(store.totalSteps).toBe(3);
		});

		it("should have 4 steps for external projects", () => {
			store.setProjectKind("external");
			expect(store.totalSteps).toBe(4);
		});

		it("should have 4 steps for student projects", () => {
			store.setProjectKind("student");
			expect(store.totalSteps).toBe(4);
		});

		it("should clear external fields when switching away from external", () => {
			store.setProjectKind("external");
			store.updateFormData({ collaboration_with: "CSIRO" });
			store.setProjectKind("science");
			expect(store.state.formData.collaboration_with).toBeUndefined();
		});

		it("should clear student fields when switching away from student", () => {
			store.setProjectKind("student");
			store.updateFormData({ organisation: "UWA" });
			store.setProjectKind("science");
			expect(store.state.formData.organisation).toBeUndefined();
		});
	});

	describe("form data", () => {
		it("updateFormData should update fields", () => {
			store.updateFormData({ title: "Test Project" });
			expect(store.state.formData.title).toBe("Test Project");
		});

		it("setBaseInformation should update base fields", () => {
			store.setBaseInformation({ title: "Base Title", description: "Desc" });
			expect(store.state.formData.title).toBe("Base Title");
			expect(store.state.formData.description).toBe("Desc");
		});

		it("setProjectDetails should update detail fields", () => {
			store.setProjectDetails({ business_area: 5 });
			expect(store.state.formData.business_area).toBe(5);
		});

		it("setLocation should update areas", () => {
			store.setLocation({ project_areas: [1, 2, 3] });
			expect(store.state.formData.project_areas).toEqual([1, 2, 3]);
		});
	});

	describe("validation", () => {
		it("setStepValidation should set validation state", () => {
			store.setStepValidation(0, true);
			expect(store.isCurrentStepValid).toBe(true);
		});

		it("validateAllSteps should return false when any step invalid", () => {
			store.setProjectKind("science");
			store.setStepValidation(0, true);
			store.setStepValidation(1, false);
			store.setStepValidation(2, true);
			expect(store.validateAllSteps()).toBe(false);
		});

		it("validateAllSteps should return true when all valid", () => {
			store.setProjectKind("science");
			store.setStepValidation(0, true);
			store.setStepValidation(1, true);
			store.setStepValidation(2, true);
			expect(store.validateAllSteps()).toBe(true);
		});
	});

	describe("computed properties", () => {
		it("progressPercentage should reflect current step", () => {
			store.setProjectKind("science");
			expect(store.progressPercentage).toBe(33);
		});

		it("isLastStep should be true on final step", () => {
			store.setProjectKind("science");
			store.setStepValidation(0, true);
			store.nextStep();
			store.setStepValidation(1, true);
			store.nextStep();
			expect(store.isLastStep).toBe(true);
		});
	});

	describe("session storage", () => {
		it("saveToSessionStorage should persist data", () => {
			store.setProjectKind("science");
			store.updateFormData({ title: "Saved Project" });
			store.saveToSessionStorage();
			expect(sessionStorage.getItem("createProjectWizard")).not.toBeNull();
		});

		it("restoreFromSessionStorage should restore data", () => {
			store.setProjectKind("science");
			store.updateFormData({ title: "Saved Project" });
			store.saveToSessionStorage();

			const newStore = new CreateProjectWizardStore();
			newStore.restoreFromSessionStorage();
			expect(newStore.state.formData.title).toBe("Saved Project");
		});

		it("clearDraft should remove session storage", () => {
			store.saveToSessionStorage();
			store.clearDraft();
			expect(sessionStorage.getItem("createProjectWizard")).toBeNull();
		});
	});

	describe("preview and submitting", () => {
		it("togglePreview should toggle showPreview", () => {
			store.togglePreview();
			expect(store.state.showPreview).toBe(true);
			store.togglePreview();
			expect(store.state.showPreview).toBe(false);
		});

		it("setSubmitting should update state", () => {
			store.setSubmitting(true);
			expect(store.state.isSubmitting).toBe(true);
		});
	});

	describe("reset", () => {
		it("should reset all state to defaults", () => {
			store.setProjectKind("science");
			store.updateFormData({ title: "Test" });
			store.setStepValidation(0, true);
			store.nextStep();
			store.reset();
			expect(store.state.currentStep).toBe(0);
			expect(store.state.formData.title).toBe("");
			expect(store.state.isSubmitting).toBe(false);
		});
	});
});
