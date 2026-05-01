import { describe, it, expect } from "vitest";
import {
	ProjectWizardStore,
	type IWizardTeamMember,
} from "./project-wizard.store";

/**
 * Helper to create a team member with sensible defaults.
 */
const makeMember = (
	overrides: Partial<IWizardTeamMember> & { userId: number }
): IWizardTeamMember => ({
	role: "research",
	isLeader: false,
	displayName: `User ${overrides.userId}`,
	position: 0,
	isStaff: false,
	timeAllocation: 0,
	...overrides,
});

describe("ProjectWizardStore — addTeamMember", () => {
	it("should add a team member to an empty list", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1 }));

		expect(store.state.teamMembers).toHaveLength(1);
		expect(store.state.teamMembers[0].userId).toBe(1);
	});

	it("should assign position based on current list length", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1 }));
		store.addTeamMember(makeMember({ userId: 2 }));

		expect(store.state.teamMembers[0].position).toBe(0);
		expect(store.state.teamMembers[1].position).toBe(1);
	});

	it("should silently prevent duplicate userId", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1 }));
		store.addTeamMember(makeMember({ userId: 1 }));

		expect(store.state.teamMembers).toHaveLength(1);
	});

	it("should allow adding multiple distinct members", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1 }));
		store.addTeamMember(makeMember({ userId: 2 }));
		store.addTeamMember(makeMember({ userId: 3 }));

		expect(store.state.teamMembers).toHaveLength(3);
	});
});

describe("ProjectWizardStore — removeTeamMember", () => {
	it("should remove a non-leader team member", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1 }));
		store.addTeamMember(makeMember({ userId: 2 }));
		store.removeTeamMember(2);

		expect(store.state.teamMembers).toHaveLength(1);
		expect(store.state.teamMembers[0].userId).toBe(1);
	});

	it("should not remove the project leader", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1, isLeader: true }));
		store.addTeamMember(makeMember({ userId: 2 }));
		store.removeTeamMember(1);

		expect(store.state.teamMembers).toHaveLength(2);
		expect(store.state.teamMembers.find((m) => m.userId === 1)).toBeDefined();
	});

	it("should recalculate positions after removal", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1 }));
		store.addTeamMember(makeMember({ userId: 2 }));
		store.addTeamMember(makeMember({ userId: 3 }));
		store.removeTeamMember(2);

		expect(store.state.teamMembers.map((m) => m.position)).toEqual([0, 1]);
	});

	it("should be a no-op when userId does not exist", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1 }));
		store.removeTeamMember(999);

		expect(store.state.teamMembers).toHaveLength(1);
	});
});

describe("ProjectWizardStore — reorderTeamMembers", () => {
	it("should reorder members by moving from one index to another", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1, isLeader: true }));
		store.addTeamMember(makeMember({ userId: 2 }));
		store.addTeamMember(makeMember({ userId: 3 }));

		// Move member at index 2 to index 1
		store.reorderTeamMembers(2, 1);

		expect(store.state.teamMembers.map((m) => m.userId)).toEqual([1, 3, 2]);
	});

	it("should recalculate positions after reorder", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1, isLeader: true }));
		store.addTeamMember(makeMember({ userId: 2 }));
		store.addTeamMember(makeMember({ userId: 3 }));

		store.reorderTeamMembers(2, 1);

		expect(store.state.teamMembers.map((m) => m.position)).toEqual([0, 1, 2]);
	});

	it("should prevent moving the leader away from position 0", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1, isLeader: true }));
		store.addTeamMember(makeMember({ userId: 2 }));
		store.addTeamMember(makeMember({ userId: 3 }));

		store.reorderTeamMembers(0, 2);

		// Leader should still be at position 0
		expect(store.state.teamMembers[0].userId).toBe(1);
		expect(store.state.teamMembers[0].isLeader).toBe(true);
	});

	it("should prevent moving a non-leader to position 0", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1, isLeader: true }));
		store.addTeamMember(makeMember({ userId: 2 }));
		store.addTeamMember(makeMember({ userId: 3 }));

		store.reorderTeamMembers(2, 0);

		// Leader should still be at position 0
		expect(store.state.teamMembers[0].userId).toBe(1);
		expect(store.state.teamMembers[0].isLeader).toBe(true);
	});
});

describe("ProjectWizardStore — syncLeaderToTeam", () => {
	it("should add the leader to the team when not already present", () => {
		const store = new ProjectWizardStore();
		store.setProjectDetails({ project_leader: 42 });
		store.syncLeaderToTeam();

		expect(store.state.teamMembers).toHaveLength(1);
		expect(store.state.teamMembers[0].userId).toBe(42);
		expect(store.state.teamMembers[0].isLeader).toBe(true);
		expect(store.state.teamMembers[0].position).toBe(0);
	});

	it("should promote an existing member to leader and move to position 0", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 10 }));
		store.addTeamMember(makeMember({ userId: 20 }));

		store.setProjectDetails({ project_leader: 20 });
		store.syncLeaderToTeam();

		expect(store.state.teamMembers[0].userId).toBe(20);
		expect(store.state.teamMembers[0].isLeader).toBe(true);
		expect(store.state.teamMembers[1].userId).toBe(10);
	});

	it("should demote the old leader when a new leader is set", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1, isLeader: true }));
		store.addTeamMember(makeMember({ userId: 2 }));

		store.setProjectDetails({ project_leader: 2 });
		store.syncLeaderToTeam();

		const oldLeader = store.state.teamMembers.find((m) => m.userId === 1);
		expect(oldLeader?.isLeader).toBe(false);

		const newLeader = store.state.teamMembers.find((m) => m.userId === 2);
		expect(newLeader?.isLeader).toBe(true);
	});

	it("should set the leader role to 'supervising'", () => {
		const store = new ProjectWizardStore();
		store.setProjectDetails({ project_leader: 5 });
		store.syncLeaderToTeam();

		expect(store.state.teamMembers[0].role).toBe("supervising");
	});

	it("should remove leader flag from all members when project_leader is null", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1, isLeader: true }));
		store.addTeamMember(makeMember({ userId: 2 }));

		store.setProjectDetails({ project_leader: null });
		store.syncLeaderToTeam();

		expect(store.state.teamMembers.every((m) => !m.isLeader)).toBe(true);
	});

	it("should recalculate positions after syncing leader", () => {
		const store = new ProjectWizardStore();
		store.addTeamMember(makeMember({ userId: 1 }));
		store.addTeamMember(makeMember({ userId: 2 }));
		store.addTeamMember(makeMember({ userId: 3 }));

		store.setProjectDetails({ project_leader: 3 });
		store.syncLeaderToTeam();

		expect(store.state.teamMembers.map((m) => m.position)).toEqual([0, 1, 2]);
		expect(store.state.teamMembers[0].userId).toBe(3);
	});
});

/**
 * Tests for auto-populate custodian logic.
 *
 * The actual auto-populate happens in ProjectDetailsStep's handleLeaderSelect:
 *   if (userId && !formData.data_custodian) {
 *     wizardStore.setProjectDetails({ data_custodian: userId });
 *   }
 *
 * We test the store-level behaviour that supports this pattern.
 */
describe("Auto-populate data custodian from project leader", () => {
	it("should allow setting data_custodian to the same value as project_leader when custodian is null", () => {
		const store = new ProjectWizardStore();
		const leaderId = 42;

		store.setProjectDetails({ project_leader: leaderId });

		// Simulate the auto-populate condition: custodian is null
		expect(store.state.formData.projectDetails.data_custodian).toBeNull();

		// Auto-populate
		store.setProjectDetails({ data_custodian: leaderId });
		expect(store.state.formData.projectDetails.data_custodian).toBe(leaderId);
	});

	it("should not overwrite an existing non-null data_custodian", () => {
		const store = new ProjectWizardStore();
		const existingCustodian = 10;
		const newLeader = 42;

		store.setProjectDetails({ data_custodian: existingCustodian });
		store.setProjectDetails({ project_leader: newLeader });

		// Simulate the auto-populate condition check
		const shouldAutoPopulate =
			newLeader !== null &&
			store.state.formData.projectDetails.data_custodian === null;

		expect(shouldAutoPopulate).toBe(false);
		expect(store.state.formData.projectDetails.data_custodian).toBe(
			existingCustodian
		);
	});

	it("should allow the user to change data_custodian after auto-population", () => {
		const store = new ProjectWizardStore();
		const leaderId = 42;
		const differentCustodian = 99;

		// Auto-populate
		store.setProjectDetails({ project_leader: leaderId });
		store.setProjectDetails({ data_custodian: leaderId });

		// User changes custodian
		store.setProjectDetails({ data_custodian: differentCustodian });
		expect(store.state.formData.projectDetails.data_custodian).toBe(
			differentCustodian
		);
	});

	it("should auto-populate when leader changes and custodian was cleared", () => {
		const store = new ProjectWizardStore();

		// Set and then clear custodian
		store.setProjectDetails({ data_custodian: 10 });
		store.setProjectDetails({ data_custodian: null });

		// Now set leader — custodian is null, so auto-populate should apply
		const leaderId = 50;
		store.setProjectDetails({ project_leader: leaderId });

		const shouldAutoPopulate =
			leaderId !== null &&
			store.state.formData.projectDetails.data_custodian === null;

		expect(shouldAutoPopulate).toBe(true);
	});

	it("should not auto-populate when project_leader is set to null", () => {
		const store = new ProjectWizardStore();

		store.setProjectDetails({ project_leader: null });

		const shouldAutoPopulate =
			store.state.formData.projectDetails.project_leader !== null &&
			store.state.formData.projectDetails.data_custodian === null;

		expect(shouldAutoPopulate).toBe(false);
	});
});

/**
 * Tests for location filtering logic.
 *
 * The LocationStep only includes dbcaRegions and dbcaDistricts from useLocations().
 * This test verifies the filtering logic that excludes ibra, imcra, and nrm.
 */
describe("Location filtering — only dbcaregion and dbcadistrict pass through", () => {
	interface SimpleLocation {
		id: number;
		name: string;
		area_type: string;
	}

	/**
	 * Replicates the filtering logic from LocationStep's allLocations memo.
	 * The component only uses dbcaRegions and dbcaDistricts from useLocations().
	 */
	const filterLocations = (
		allByType: Record<string, SimpleLocation[]>
	): SimpleLocation[] => {
		const result: SimpleLocation[] = [];
		if (allByType.dbcaregion) {
			result.push(...allByType.dbcaregion);
		}
		if (allByType.dbcadistrict) {
			result.push(...allByType.dbcadistrict);
		}
		return result;
	};

	it("should include dbcaregion locations", () => {
		const locations = filterLocations({
			dbcaregion: [{ id: 1, name: "Kimberley", area_type: "dbcaregion" }],
			dbcadistrict: [],
			ibra: [],
			imcra: [],
			nrm: [],
		});

		expect(locations).toHaveLength(1);
		expect(locations[0].name).toBe("Kimberley");
	});

	it("should include dbcadistrict locations", () => {
		const locations = filterLocations({
			dbcaregion: [],
			dbcadistrict: [
				{ id: 2, name: "Swan Coastal", area_type: "dbcadistrict" },
			],
			ibra: [],
			imcra: [],
			nrm: [],
		});

		expect(locations).toHaveLength(1);
		expect(locations[0].name).toBe("Swan Coastal");
	});

	it("should exclude ibra locations", () => {
		const locations = filterLocations({
			dbcaregion: [],
			dbcadistrict: [],
			ibra: [{ id: 3, name: "Avon Wheatbelt", area_type: "ibra" }],
			imcra: [],
			nrm: [],
		});

		expect(locations).toHaveLength(0);
	});

	it("should exclude imcra locations", () => {
		const locations = filterLocations({
			dbcaregion: [],
			dbcadistrict: [],
			ibra: [],
			imcra: [{ id: 4, name: "Central West Coast", area_type: "imcra" }],
			nrm: [],
		});

		expect(locations).toHaveLength(0);
	});

	it("should exclude nrm locations", () => {
		const locations = filterLocations({
			dbcaregion: [],
			dbcadistrict: [],
			ibra: [],
			imcra: [],
			nrm: [{ id: 5, name: "South West", area_type: "nrm" }],
		});

		expect(locations).toHaveLength(0);
	});

	it("should include only dbcaregion and dbcadistrict from a mixed set", () => {
		const locations = filterLocations({
			dbcaregion: [
				{ id: 1, name: "Kimberley", area_type: "dbcaregion" },
				{ id: 2, name: "Pilbara", area_type: "dbcaregion" },
			],
			dbcadistrict: [
				{ id: 3, name: "Swan Coastal", area_type: "dbcadistrict" },
			],
			ibra: [{ id: 4, name: "Avon Wheatbelt", area_type: "ibra" }],
			imcra: [{ id: 5, name: "Central West Coast", area_type: "imcra" }],
			nrm: [{ id: 6, name: "South West", area_type: "nrm" }],
		});

		expect(locations).toHaveLength(3);
		expect(locations.map((l) => l.area_type)).toEqual([
			"dbcaregion",
			"dbcaregion",
			"dbcadistrict",
		]);
	});

	it("should return an empty array when no locations of any type exist", () => {
		const locations = filterLocations({
			dbcaregion: [],
			dbcadistrict: [],
			ibra: [],
			imcra: [],
			nrm: [],
		});

		expect(locations).toHaveLength(0);
	});

	it("should handle missing keys gracefully", () => {
		const locations = filterLocations({});
		expect(locations).toHaveLength(0);
	});
});

describe("ProjectWizardStore — project kind handling", () => {
	it("should initialise external details when kind is external", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("external");
		expect(store.state.formData.externalDetails).not.toBeNull();
		expect(store.state.formData.studentDetails).toBeNull();
	});

	it("should initialise student details when kind is student", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("student");
		expect(store.state.formData.studentDetails).not.toBeNull();
		expect(store.state.formData.externalDetails).toBeNull();
	});

	it("should clear conditional details for science projects", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("external");
		store.setProjectKind("science");
		expect(store.state.formData.externalDetails).toBeNull();
		expect(store.state.formData.studentDetails).toBeNull();
	});

	it("should have 3 steps for science projects", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		expect(store.totalSteps).toBe(3);
	});

	it("should have 3 steps for core_function projects", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("core_function");
		expect(store.totalSteps).toBe(3);
	});

	it("should have 4 steps for external projects", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("external");
		expect(store.totalSteps).toBe(4);
	});

	it("should have 4 steps for student projects", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("student");
		expect(store.totalSteps).toBe(4);
	});
});

describe("ProjectWizardStore — step navigation", () => {
	it("should start at step 0", () => {
		const store = new ProjectWizardStore();
		expect(store.state.currentStep).toBe(0);
	});

	it("should not go forward when current step is invalid", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		// Step 0 has no validation set — defaults to invalid
		store.goToNextStep();
		expect(store.state.currentStep).toBe(0);
	});

	it("should go forward when current step is valid", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		store.setStepValidation(0, true);
		store.goToNextStep();
		expect(store.state.currentStep).toBe(1);
	});

	it("should always allow going backward", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		store.setStepValidation(0, true);
		store.goToNextStep();
		expect(store.state.currentStep).toBe(1);
		store.goToPreviousStep();
		expect(store.state.currentStep).toBe(0);
	});

	it("should not go backward from step 0", () => {
		const store = new ProjectWizardStore();
		store.goToPreviousStep();
		expect(store.state.currentStep).toBe(0);
	});

	it("should not go forward past last step", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science"); // 3 steps
		store.setStepValidation(0, true);
		store.setStepValidation(1, true);
		store.goToNextStep(); // step 1
		store.goToNextStep(); // step 2 (last)
		store.setStepValidation(2, true);
		store.goToNextStep(); // should stay at 2
		expect(store.state.currentStep).toBe(2);
	});

	it("should mark step as completed when navigating forward", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		store.setStepValidation(0, true);
		store.goToNextStep();
		expect(store.state.completedSteps.has(0)).toBe(true);
	});

	it("goToStep should allow jumping to completed steps", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		store.setStepValidation(0, true);
		store.goToNextStep(); // now at step 1, step 0 completed
		store.goToStep(0); // jump back to step 0
		expect(store.state.currentStep).toBe(0);
	});

	it("goToStep should not allow jumping to uncompleted future steps", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		store.goToStep(2); // step 1 not completed
		expect(store.state.currentStep).toBe(0);
	});
});

describe("ProjectWizardStore — validation", () => {
	it("should set step validation", () => {
		const store = new ProjectWizardStore();
		store.setStepValidation(0, true);
		expect(store.state.validation[0]).toEqual({ isValid: true, errors: {} });
	});

	it("should set step validation with errors", () => {
		const store = new ProjectWizardStore();
		store.setStepValidation(0, false, { title: "Required" });
		expect(store.state.validation[0]).toEqual({
			isValid: false,
			errors: { title: "Required" },
		});
	});

	it("isCurrentStepValid should reflect validation state", () => {
		const store = new ProjectWizardStore();
		expect(store.isCurrentStepValid).toBe(false); // no validation set
		store.setStepValidation(0, true);
		expect(store.isCurrentStepValid).toBe(true);
	});

	it("validateAllSteps should return false when any step is invalid", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		store.setStepValidation(0, true);
		store.setStepValidation(1, false);
		store.setStepValidation(2, true);
		expect(store.validateAllSteps()).toBe(false);
	});

	it("validateAllSteps should return true when all steps are valid", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		store.setStepValidation(0, true);
		store.setStepValidation(1, true);
		store.setStepValidation(2, true);
		expect(store.validateAllSteps()).toBe(true);
	});

	it("revalidateAllStepsFromData should detect missing required fields", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		const firstInvalid = store.revalidateAllStepsFromData();
		expect(firstInvalid).toBe(0); // step 0 has empty title/description/keywords
	});

	it("revalidateAllStepsFromData should return -1 when all valid", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		store.setBaseInformation({
			title: "Test",
			description: "Desc",
			keywords: ["fauna"],
		});
		store.setProjectDetails({
			business_area: 1,
			start_date: new Date(),
			project_leader: 10,
			data_custodian: 11,
		});
		const firstInvalid = store.revalidateAllStepsFromData();
		expect(firstInvalid).toBe(-1);
	});

	it("revalidateAllStepsFromData should validate external details", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("external");
		store.setBaseInformation({
			title: "Test",
			description: "Desc",
			keywords: ["fauna"],
		});
		store.setProjectDetails({
			business_area: 1,
			start_date: new Date(),
			project_leader: 10,
			data_custodian: 11,
		});
		// External details missing collaboration_with
		const firstInvalid = store.revalidateAllStepsFromData();
		expect(firstInvalid).toBe(3); // step 3 = external details
	});

	it("revalidateAllStepsFromData should validate student details", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("student");
		store.setBaseInformation({
			title: "Test",
			description: "Desc",
			keywords: ["fauna"],
		});
		store.setProjectDetails({
			business_area: 1,
			start_date: new Date(),
			project_leader: 10,
			data_custodian: 11,
		});
		// Student details missing organisation and level
		const firstInvalid = store.revalidateAllStepsFromData();
		expect(firstInvalid).toBe(3); // step 3 = student details
	});
});

describe("ProjectWizardStore — computed properties", () => {
	it("progressPercentage should reflect current step", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science"); // 3 steps
		expect(store.progressPercentage).toBe(33); // step 0 of 3 = 33%
		store.setStepValidation(0, true);
		store.goToNextStep();
		expect(store.progressPercentage).toBe(67); // step 1 of 3 = 67%
	});

	it("isLastStep should be true on final step", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science"); // 3 steps
		expect(store.isLastStep).toBe(false);
		store.setStepValidation(0, true);
		store.goToNextStep();
		store.setStepValidation(1, true);
		store.goToNextStep();
		expect(store.isLastStep).toBe(true);
	});

	it("canGoBack should be false at step 0", () => {
		const store = new ProjectWizardStore();
		expect(store.canGoBack).toBe(false);
	});

	it("canGoBack should be true at step 1+", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		store.setStepValidation(0, true);
		store.goToNextStep();
		expect(store.canGoBack).toBe(true);
	});
});

describe("ProjectWizardStore — resetWizard", () => {
	it("should clear all form data and state", () => {
		const store = new ProjectWizardStore();
		store.setProjectKind("science");
		store.setBaseInformation({ title: "Test" });
		store.setProjectDetails({ business_area: 1 });
		store.addTeamMember(makeMember({ userId: 1 }));
		store.setStepValidation(0, true);
		store.goToNextStep();

		store.resetWizard();

		expect(store.state.currentStep).toBe(0);
		expect(store.state.formData.baseInformation.title).toBe("");
		expect(store.state.teamMembers).toHaveLength(0);
		expect(store.state.completedSteps.size).toBe(0);
		expect(store.state.touchedSteps.size).toBe(0);
		expect(store.state.touchedFields.size).toBe(0);
		expect(store.state.isSubmitting).toBe(false);
	});
});

describe("ProjectWizardStore — touched state tracking", () => {
	it("should track touched steps", () => {
		const store = new ProjectWizardStore();
		store.markStepTouched(0);
		expect(store.state.touchedSteps.has(0)).toBe(true);
		expect(store.state.touchedSteps.has(1)).toBe(false);
	});

	it("should track touched fields", () => {
		const store = new ProjectWizardStore();
		store.markFieldTouched("title");
		expect(store.state.touchedFields.has("title")).toBe(true);
		expect(store.state.touchedFields.has("description")).toBe(false);
	});
});

describe("ProjectWizardStore — form data setters", () => {
	it("setExternalDetails should initialise null details", () => {
		const store = new ProjectWizardStore();
		store.setExternalDetails({ collaboration_with: "CSIRO" });
		expect(store.state.formData.externalDetails?.collaboration_with).toBe(
			"CSIRO"
		);
	});

	it("setStudentDetails should initialise null details", () => {
		const store = new ProjectWizardStore();
		store.setStudentDetails({ organisation: "UWA" });
		expect(store.state.formData.studentDetails?.organisation).toBe("UWA");
	});

	it("setLocation should update areas", () => {
		const store = new ProjectWizardStore();
		store.setLocation({ areas: [1, 2, 3] });
		expect(store.state.formData.location.areas).toEqual([1, 2, 3]);
	});
});
