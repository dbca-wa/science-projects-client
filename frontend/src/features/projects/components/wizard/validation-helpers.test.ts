import { describe, it, expect } from "vitest";
import { shouldShowError } from "./validation-helpers";
import { ProjectWizardStore } from "@/app/stores/derived/project-wizard.store";

describe("shouldShowError", () => {
	const createStore = () => new ProjectWizardStore();

	it("should return false when neither step nor field is touched", () => {
		const store = createStore();
		expect(shouldShowError(store, "title", 0)).toBe(false);
	});

	it("should return true when the step is touched", () => {
		const store = createStore();
		store.markStepTouched(0);
		expect(shouldShowError(store, "title", 0)).toBe(true);
	});

	it("should return true when the field is touched", () => {
		const store = createStore();
		store.markFieldTouched("title");
		expect(shouldShowError(store, "title", 0)).toBe(true);
	});

	it("should return true when both step and field are touched", () => {
		const store = createStore();
		store.markStepTouched(0);
		store.markFieldTouched("title");
		expect(shouldShowError(store, "title", 0)).toBe(true);
	});

	it("should return false for a different step index", () => {
		const store = createStore();
		store.markStepTouched(1);
		expect(shouldShowError(store, "title", 0)).toBe(false);
	});

	it("should return false for a different field name", () => {
		const store = createStore();
		store.markFieldTouched("description");
		expect(shouldShowError(store, "title", 0)).toBe(false);
	});

	it("should handle multiple steps touched independently", () => {
		const store = createStore();
		store.markStepTouched(0);
		store.markStepTouched(2);

		expect(shouldShowError(store, "title", 0)).toBe(true);
		expect(shouldShowError(store, "areas", 2)).toBe(true);
		expect(shouldShowError(store, "start_date", 1)).toBe(false);
	});

	it("should handle multiple fields touched independently", () => {
		const store = createStore();
		store.markFieldTouched("title");
		store.markFieldTouched("description");

		expect(shouldShowError(store, "title", 0)).toBe(true);
		expect(shouldShowError(store, "description", 0)).toBe(true);
		expect(shouldShowError(store, "keywords", 0)).toBe(false);
	});

	it("should return true via field touch even when step is not touched", () => {
		const store = createStore();
		store.markFieldTouched("start_date");
		// Step 1 is not touched, but the field is
		expect(shouldShowError(store, "start_date", 1)).toBe(true);
	});
});
