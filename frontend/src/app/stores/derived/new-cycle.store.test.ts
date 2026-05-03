/**
 * Tests for NewCycleStore
 *
 * Covers: state management, computed properties, localStorage persistence,
 * draft export/import, validation logic.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NewCycleStore } from "./new-cycle.store";

describe("NewCycleStore", () => {
	let store: NewCycleStore;

	beforeEach(() => {
		localStorage.clear();
		store = new NewCycleStore();
	});

	afterEach(() => {
		store.dispose();
	});

	describe("defaults", () => {
		it("should have prepopulateMode 'all' by default", () => {
			expect(store.state.prepopulateMode).toBe("all");
		});

		it("should have inclusionMode 'include' by default", () => {
			expect(store.state.inclusionMode).toBe("include");
		});

		it("should have no send groups selected by default", () => {
			expect(store.state.sendBaLeads).toBe(false);
			expect(store.state.sendProjectLeads).toBe(false);
			expect(store.state.sendTeamMembers).toBe(false);
		});

		it("should have custom message disabled by default", () => {
			expect(store.state.customMessageEnabled).toBe(false);
		});
	});

	describe("actions", () => {
		it("setPrepopulateMode should update the mode", () => {
			store.setPrepopulateMode("partial");
			expect(store.state.prepopulateMode).toBe("partial");
		});

		it("setInclusionMode should update the mode", () => {
			store.setInclusionMode("active-only");
			expect(store.state.inclusionMode).toBe("active-only");
		});

		it("setSendBaLeads should toggle the flag", () => {
			store.setSendBaLeads(true);
			expect(store.state.sendBaLeads).toBe(true);
		});

		it("excludeUser should add user to excluded list", () => {
			store.excludeUser(42);
			expect(store.state.excludedUserIds).toContain(42);
		});

		it("excludeUser should not duplicate", () => {
			store.excludeUser(42);
			store.excludeUser(42);
			expect(
				store.state.excludedUserIds.filter((id) => id === 42)
			).toHaveLength(1);
		});

		it("restoreUser should remove user from excluded list", () => {
			store.excludeUser(42);
			store.restoreUser(42);
			expect(store.state.excludedUserIds).not.toContain(42);
		});

		it("setCustomMessage should update the message", () => {
			store.setCustomMessage("<p>Hello</p>");
			expect(store.state.customMessage).toBe("<p>Hello</p>");
		});

		it("setGroupMessage should update a specific group", () => {
			store.setGroupMessage("ba_leads", "<p>BA message</p>");
			expect(store.state.customMessages.ba_leads).toBe("<p>BA message</p>");
			expect(store.state.customMessages.project_leads).toBe("");
		});
	});

	describe("computed properties", () => {
		it("backendUpdate should be true when inclusionMode is 'include'", () => {
			store.setInclusionMode("include");
			expect(store.backendUpdate).toBe(true);
		});

		it("backendUpdate should be false when inclusionMode is 'active-only'", () => {
			store.setInclusionMode("active-only");
			expect(store.backendUpdate).toBe(false);
		});

		it("backendPrepopulate should be true when prepopulateMode is 'all'", () => {
			store.setPrepopulateMode("all");
			expect(store.backendPrepopulate).toBe(true);
		});

		it("backendPrepopulate should be false when prepopulateMode is 'partial'", () => {
			store.setPrepopulateMode("partial");
			expect(store.backendPrepopulate).toBe(false);
		});

		it("anySendGroup should be true when at least one group is selected", () => {
			expect(store.anySendGroup).toBe(false);
			store.setSendBaLeads(true);
			expect(store.anySendGroup).toBe(true);
		});

		it("checkedGroupKeys should return only selected groups", () => {
			store.setSendBaLeads(true);
			store.setSendTeamMembers(true);
			expect(store.checkedGroupKeys).toEqual(["ba_leads", "team_members"]);
		});

		it("sendGroupCount should return the number of selected groups", () => {
			expect(store.sendGroupCount).toBe(0);
			store.setSendBaLeads(true);
			store.setSendProjectLeads(true);
			expect(store.sendGroupCount).toBe(2);
		});

		it("canSubmit should be true by default", () => {
			expect(store.canSubmit).toBe(true);
		});

		it("canSubmit should be false when custom message is enabled but empty", () => {
			store.setCustomMessageEnabled(true);
			expect(store.canSubmit).toBe(false);
		});

		it("canSubmit should be true when custom message is enabled and has content", () => {
			store.setCustomMessageEnabled(true);
			store.setCustomMessage("<p>Hello world</p>");
			expect(store.canSubmit).toBe(true);
		});

		it("isCustomMessageValid should handle per-group with disabled groups", () => {
			store.setCustomMessageEnabled(true);
			store.setPerGroupEnabled(true);
			store.setSendBaLeads(true);
			store.setSendProjectLeads(true);

			// BA leads has custom enabled but empty — invalid
			store.setGroupCustomEnabled("ba_leads", true);
			store.setGroupCustomEnabled("project_leads", false); // Uses default — valid
			expect(store.isCustomMessageValid).toBe(false);

			// Add content to BA leads — now valid
			store.setGroupMessage("ba_leads", "<p>Content</p>");
			expect(store.isCustomMessageValid).toBe(true);
		});

		it("isCustomMessageValid should treat <p></p> as empty", () => {
			store.setCustomMessageEnabled(true);
			store.setCustomMessage("<p></p>");
			expect(store.isCustomMessageValid).toBe(false);
		});
	});

	describe("localStorage persistence", () => {
		it("should save state to localStorage", async () => {
			store.setSendBaLeads(true);
			store.setCustomMessage("<p>Test</p>");

			// Wait for the debounced reaction (300ms)
			await new Promise((r) => setTimeout(r, 400));

			const stored = localStorage.getItem("spms_new_cycle_draft");
			expect(stored).not.toBeNull();
			const parsed = JSON.parse(stored!);
			expect(parsed.sendBaLeads).toBe(true);
			expect(parsed.customMessage).toBe("<p>Test</p>");
		});

		it("should restore state from localStorage on construction", () => {
			localStorage.setItem(
				"spms_new_cycle_draft",
				JSON.stringify({
					sendBaLeads: true,
					prepopulateMode: "partial",
					customMessage: "<p>Restored</p>",
				})
			);

			const newStore = new NewCycleStore();
			expect(newStore.state.sendBaLeads).toBe(true);
			expect(newStore.state.prepopulateMode).toBe("partial");
			expect(newStore.state.customMessage).toBe("<p>Restored</p>");
			newStore.dispose();
		});

		it("should handle corrupt localStorage gracefully", () => {
			localStorage.setItem("spms_new_cycle_draft", "not-json");
			const newStore = new NewCycleStore();
			// Should not throw, should use defaults
			expect(newStore.state.prepopulateMode).toBe("all");
			newStore.dispose();
		});
	});

	describe("reset", () => {
		it("should clear all state to defaults", () => {
			store.setSendBaLeads(true);
			store.setCustomMessageEnabled(true);
			store.setCustomMessage("<p>Test</p>");
			store.setPrepopulateMode("partial");

			store.reset();

			expect(store.state.sendBaLeads).toBe(false);
			expect(store.state.customMessageEnabled).toBe(false);
			expect(store.state.customMessage).toBe("");
			expect(store.state.prepopulateMode).toBe("all");
		});

		it("should remove localStorage draft", () => {
			localStorage.setItem("spms_new_cycle_draft", "{}");
			store.reset();
			expect(localStorage.getItem("spms_new_cycle_draft")).toBeNull();
		});

		it("should clear excluded users", () => {
			store.excludeUser(1);
			store.excludeUser(2);
			store.excludeUser(3);
			store.reset();
			expect(store.state.excludedUserIds).toEqual([]);
		});

		it("should clear per-group custom messages", () => {
			store.setPerGroupEnabled(true);
			store.setGroupMessage("ba_leads", "<p>BA message</p>");
			store.setGroupMessage("project_leads", "<p>PL message</p>");
			store.reset();
			expect(store.state.customMessages.ba_leads).toBe("");
			expect(store.state.customMessages.project_leads).toBe("");
			expect(store.state.customMessages.team_members).toBe("");
			expect(store.state.perGroupEnabled).toBe(false);
		});

		it("should reset inclusion mode to default", () => {
			store.setInclusionMode("active-only");
			store.reset();
			expect(store.state.inclusionMode).toBe("include");
		});

		it("should reset all send group flags", () => {
			store.setSendBaLeads(true);
			store.setSendProjectLeads(true);
			store.setSendTeamMembers(true);
			store.reset();
			expect(store.state.sendBaLeads).toBe(false);
			expect(store.state.sendProjectLeads).toBe(false);
			expect(store.state.sendTeamMembers).toBe(false);
		});
	});

	describe("exportDraft / importDraft", () => {
		it("exportDraft should return serialisable state", () => {
			store.setSendBaLeads(true);
			store.setCustomMessage("<p>Export test</p>");

			const draft = store.exportDraft();
			expect(draft.sendBaLeads).toBe(true);
			expect(draft.customMessage).toBe("<p>Export test</p>");
			// Should not include internal MobX state
			expect(draft).not.toHaveProperty("loading");
			expect(draft).not.toHaveProperty("error");
		});

		it("importDraft should apply saved state", () => {
			store.importDraft({
				sendBaLeads: true,
				sendProjectLeads: true,
				prepopulateMode: "partial",
				customMessageEnabled: true,
				customMessage: "<p>Imported</p>",
			});

			expect(store.state.sendBaLeads).toBe(true);
			expect(store.state.sendProjectLeads).toBe(true);
			expect(store.state.prepopulateMode).toBe("partial");
			expect(store.state.customMessageEnabled).toBe(true);
			expect(store.state.customMessage).toBe("<p>Imported</p>");
		});

		it("importDraft should handle partial data gracefully", () => {
			store.importDraft({ sendBaLeads: true });
			expect(store.state.sendBaLeads).toBe(true);
			// Other fields should remain at defaults
			expect(store.state.prepopulateMode).toBe("all");
		});

		it("importDraft should ignore invalid types", () => {
			store.importDraft({ sendBaLeads: "not-a-boolean" as unknown });
			// Should not change — type check fails
			expect(store.state.sendBaLeads).toBe(false);
		});
	});
});
