import { describe, it, expect } from "vitest";
import {
	formatDocumentKind,
	formatRoleKind,
	getRoleColor,
	getEndorsementColor,
	calculateDashBadgeCount,
	calculateDashBadgeCountWithProjects,
	formatActionType,
	getActionColor,
	filterCaretakerTasks,
	filterAdminTasks,
	extractTextFromHTML,
	formatDeletionReason,
	formatCaretakerReason,
	buildAdminTaskDetails,
} from "./dashboard.utils";
import type { IAdminTask, AdminTaskAction } from "../types/admin-tasks.types";

describe("formatDocumentKind", () => {
	describe("when given known document kinds", () => {
		it("should format 'concept' to 'Concept Plan'", () => {
			expect(formatDocumentKind("concept")).toBe("Concept Plan");
		});

		it("should format 'projectplan' to 'Project Plan'", () => {
			expect(formatDocumentKind("projectplan")).toBe("Project Plan");
		});

		it("should format 'progressreport' to 'Progress Report'", () => {
			expect(formatDocumentKind("progressreport")).toBe("Progress Report");
		});

		it("should format 'studentreport' to 'Student Report'", () => {
			expect(formatDocumentKind("studentreport")).toBe("Student Report");
		});

		it("should format 'projectclosure' to 'Project Closure'", () => {
			expect(formatDocumentKind("projectclosure")).toBe("Project Closure");
		});
	});

	describe("when given unknown document kinds", () => {
		it("should return original value for unknown kind", () => {
			expect(formatDocumentKind("unknown")).toBe("unknown");
		});

		it("should return original value for empty string", () => {
			expect(formatDocumentKind("")).toBe("");
		});

		it("should return original value for custom kind", () => {
			expect(formatDocumentKind("custom_document")).toBe("custom_document");
		});
	});
});

describe("formatRoleKind", () => {
	describe("when given known role kinds", () => {
		it("should format 'team' to 'Team Member'", () => {
			expect(formatRoleKind("team")).toBe("Team Member");
		});

		it("should format 'project_lead' to 'Project Lead'", () => {
			expect(formatRoleKind("project_lead")).toBe("Project Lead");
		});

		it("should format 'ba_lead' to 'Business Area Lead'", () => {
			expect(formatRoleKind("ba_lead")).toBe("Business Area Lead");
		});

		it("should format 'directorate' to 'Directorate'", () => {
			expect(formatRoleKind("directorate")).toBe("Directorate");
		});
	});
});

describe("getRoleColor", () => {
	describe("when given known role kinds", () => {
		it("should return 'blue' for 'team'", () => {
			expect(getRoleColor("team")).toBe("blue");
		});

		it("should return 'green' for 'project_lead'", () => {
			expect(getRoleColor("project_lead")).toBe("green");
		});

		it("should return 'orange' for 'ba_lead'", () => {
			expect(getRoleColor("ba_lead")).toBe("orange");
		});

		it("should return 'red' for 'directorate'", () => {
			expect(getRoleColor("directorate")).toBe("red");
		});
	});
});

describe("getEndorsementColor", () => {
	describe("when given known endorsement kinds", () => {
		it("should return 'blue' for 'aec'", () => {
			expect(getEndorsementColor("aec")).toBe("blue");
		});

		it("should return 'red' for 'bm'", () => {
			expect(getEndorsementColor("bm")).toBe("red");
		});

		it("should return 'green' for 'hc'", () => {
			expect(getEndorsementColor("hc")).toBe("green");
		});
	});
});

describe("calculateDashBadgeCount", () => {
	describe("when given admin tasks array", () => {
		it("should count all admin tasks", () => {
			const adminTasks = [
				{
					id: 1,
					action: "deleteproject" as const,
					status: "pending" as const,
					requester: {
						id: 1,
						display_first_name: "John",
						display_last_name: "Doe",
						email: "john@example.com",
					},
					created_at: "2024-01-01T00:00:00Z",
					updated_at: "2024-01-01T00:00:00Z",
				},
				{
					id: 2,
					action: "mergeuser" as const,
					status: "pending" as const,
					requester: {
						id: 2,
						display_first_name: "Jane",
						display_last_name: "Smith",
						email: "jane@example.com",
					},
					created_at: "2024-01-01T00:00:00Z",
					updated_at: "2024-01-01T00:00:00Z",
				},
				{
					id: 3,
					action: "setcaretaker" as const,
					status: "pending" as const,
					requester: {
						id: 3,
						display_first_name: "Bob",
						display_last_name: "Johnson",
						email: "bob@example.com",
					},
					created_at: "2024-01-01T00:00:00Z",
					updated_at: "2024-01-01T00:00:00Z",
				},
			];

			expect(calculateDashBadgeCount(adminTasks)).toBe(3);
		});

		it("should return 0 for empty array", () => {
			expect(calculateDashBadgeCount([])).toBe(0);
		});

		it("should return 0 for undefined", () => {
			expect(calculateDashBadgeCount(undefined)).toBe(0);
		});
	});
});

describe("calculateDashBadgeCountWithProjects", () => {
	describe("when given document and endorsement tasks", () => {
		it("should sum document and AEC endorsement counts", () => {
			const documentTasks = {
				all: [{ id: 1 }, { id: 2 }, { id: 3 }],
			};
			const endorsementTasks = {
				aec: [{ id: 1 }, { id: 2 }],
			};

			expect(
				calculateDashBadgeCountWithProjects(documentTasks, endorsementTasks)
			).toBe(5);
		});

		it("should handle undefined document tasks", () => {
			const endorsementTasks = {
				aec: [{ id: 1 }],
			};

			expect(
				calculateDashBadgeCountWithProjects(undefined, endorsementTasks)
			).toBe(1);
		});

		it("should handle undefined endorsement tasks", () => {
			const documentTasks = {
				all: [{ id: 1 }, { id: 2 }],
			};

			expect(
				calculateDashBadgeCountWithProjects(documentTasks, undefined)
			).toBe(2);
		});

		it("should return 0 when both are undefined", () => {
			expect(calculateDashBadgeCountWithProjects(undefined, undefined)).toBe(0);
		});

		it("should handle empty arrays", () => {
			const documentTasks = { all: [] };
			const endorsementTasks = { aec: [] };

			expect(
				calculateDashBadgeCountWithProjects(documentTasks, endorsementTasks)
			).toBe(0);
		});
	});
});

describe("formatActionType", () => {
	describe("when given known action types", () => {
		it("should format 'deleteproject' to 'Delete Project'", () => {
			expect(formatActionType("deleteproject")).toBe("Delete Project");
		});

		it("should format 'mergeuser' to 'Merge User'", () => {
			expect(formatActionType("mergeuser")).toBe("Merge User");
		});

		it("should format 'setcaretaker' to 'Set Caretaker'", () => {
			expect(formatActionType("setcaretaker")).toBe("Set Caretaker");
		});
	});

	describe("when given unknown action types", () => {
		it("should return original value for unknown action", () => {
			expect(formatActionType("unknown")).toBe("unknown");
		});

		it("should return original value for empty string", () => {
			expect(formatActionType("")).toBe("");
		});
	});
});

describe("getActionColor", () => {
	describe("when given known action types", () => {
		it("should return 'red' for 'deleteproject'", () => {
			expect(getActionColor("deleteproject")).toBe("red");
		});

		it("should return 'blue' for 'mergeuser'", () => {
			expect(getActionColor("mergeuser")).toBe("blue");
		});

		it("should return 'green' for 'setcaretaker'", () => {
			expect(getActionColor("setcaretaker")).toBe("green");
		});
	});

	describe("when given unknown action types", () => {
		it("should return 'gray' for unknown action", () => {
			expect(getActionColor("unknown")).toBe("gray");
		});

		it("should return 'gray' for empty string", () => {
			expect(getActionColor("")).toBe("gray");
		});
	});
});

describe("filterCaretakerTasks", () => {
	const mockTasks: IAdminTask[] = [
		{
			id: 1,
			action: "setcaretaker",
			status: "pending",
			requester: {
				id: 1,
				display_first_name: "John",
				display_last_name: "Doe",
				email: "john@example.com",
			},
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
		},
		{
			id: 2,
			action: "deleteproject",
			status: "pending",
			requester: {
				id: 2,
				display_first_name: "Jane",
				display_last_name: "Smith",
				email: "jane@example.com",
			},
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
		},
		{
			id: 3,
			action: "setcaretaker",
			status: "approved",
			requester: {
				id: 3,
				display_first_name: "Bob",
				display_last_name: "Johnson",
				email: "bob@example.com",
			},
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
		},
		{
			id: 4,
			action: "mergeuser",
			status: "pending",
			requester: {
				id: 4,
				display_first_name: "Alice",
				display_last_name: "Williams",
				email: "alice@example.com",
			},
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
		},
	];

	it("should filter only caretaker tasks", () => {
		const result = filterCaretakerTasks(mockTasks);
		expect(result).toHaveLength(2);
		expect(result[0].action).toBe("setcaretaker");
		expect(result[1].action).toBe("setcaretaker");
	});

	it("should return empty array when no caretaker tasks exist", () => {
		const nonCaretakerTasks = mockTasks.filter(
			(t) => t.action !== "setcaretaker"
		);
		const result = filterCaretakerTasks(nonCaretakerTasks);
		expect(result).toHaveLength(0);
	});

	it("should return empty array for empty input", () => {
		const result = filterCaretakerTasks([]);
		expect(result).toHaveLength(0);
	});
});

describe("filterAdminTasks", () => {
	const mockTasks: IAdminTask[] = [
		{
			id: 1,
			action: "setcaretaker",
			status: "pending",
			requester: {
				id: 1,
				display_first_name: "John",
				display_last_name: "Doe",
				email: "john@example.com",
			},
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
		},
		{
			id: 2,
			action: "deleteproject",
			status: "pending",
			requester: {
				id: 2,
				display_first_name: "Jane",
				display_last_name: "Smith",
				email: "jane@example.com",
			},
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
		},
		{
			id: 3,
			action: "mergeuser",
			status: "pending",
			requester: {
				id: 3,
				display_first_name: "Bob",
				display_last_name: "Johnson",
				email: "bob@example.com",
			},
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
		},
	];

	it("should filter out caretaker tasks", () => {
		const result = filterAdminTasks(mockTasks);
		expect(result).toHaveLength(2);
		expect(result[0].action).toBe("deleteproject");
		expect(result[1].action).toBe("mergeuser");
	});

	it("should return empty array when only caretaker tasks exist", () => {
		const onlyCaretaker = mockTasks.filter((t) => t.action === "setcaretaker");
		const result = filterAdminTasks(onlyCaretaker);
		expect(result).toHaveLength(0);
	});

	it("should return empty array for empty input", () => {
		const result = filterAdminTasks([]);
		expect(result).toHaveLength(0);
	});
});

describe("extractTextFromHTML", () => {
	describe("when given edge cases", () => {
		it("should return empty string for undefined", () => {
			expect(extractTextFromHTML(undefined)).toBe("");
		});

		it("should return empty string for empty string", () => {
			expect(extractTextFromHTML("")).toBe("");
		});
	});

	// Note: Tests that require DOM manipulation are skipped because
	// this function uses document.createElement which is browser-specific.
	// The function is tested manually in the browser and through E2E tests.
	describe.skip("when given HTML (requires browser DOM)", () => {
		it("should extract text from <p> tag", () => {
			const html = "<p>Project Title</p>";
			expect(extractTextFromHTML(html)).toBe("Project Title");
		});

		it("should extract text from nested <p> tag", () => {
			const html = "<div><p>Nested Title</p></div>";
			expect(extractTextFromHTML(html)).toBe("Nested Title");
		});

		it("should extract text from <span> tag", () => {
			const html = "<span>Span Title</span>";
			expect(extractTextFromHTML(html)).toBe("Span Title");
		});

		it("should extract text from <h1> tag", () => {
			const html = "<h1>Heading Title</h1>";
			expect(extractTextFromHTML(html)).toBe("Heading Title");
		});

		it("should extract text from <h2> tag", () => {
			const html = "<h2>Subheading</h2>";
			expect(extractTextFromHTML(html)).toBe("Subheading");
		});

		it("should return plain text as-is", () => {
			const text = "Plain Text Title";
			expect(extractTextFromHTML(text)).toBe("Plain Text Title");
		});

		it("should handle HTML with multiple tags (returns first match)", () => {
			const html = "<p>First</p><p>Second</p>";
			expect(extractTextFromHTML(html)).toBe("First");
		});

		it("should handle HTML with no matching tags", () => {
			const html = "<div>No matching tags</div>";
			expect(extractTextFromHTML(html)).toBe("No matching tags");
		});
	});
});

describe("formatDeletionReason", () => {
	describe("when given known deletion reasons", () => {
		it("should format 'duplicate' to 'Duplicate project'", () => {
			expect(formatDeletionReason("duplicate")).toBe("Duplicate project");
		});

		it("should format 'mistake' to 'Made by mistake'", () => {
			expect(formatDeletionReason("mistake")).toBe("Made by mistake");
		});

		it("should format 'other' to 'Other'", () => {
			expect(formatDeletionReason("other")).toBe("Other");
		});

		it("should handle case-insensitive known reasons", () => {
			expect(formatDeletionReason("DUPLICATE")).toBe("Duplicate project");
			expect(formatDeletionReason("Mistake")).toBe("Made by mistake");
		});
	});

	describe("when given custom reasons", () => {
		it("should capitalize first letter of custom reason", () => {
			expect(formatDeletionReason("custom reason")).toBe("Custom reason");
		});

		it("should handle already capitalized custom reason", () => {
			expect(formatDeletionReason("Custom Reason")).toBe("Custom Reason");
		});
	});

	describe("when given edge cases", () => {
		it("should return empty string for undefined", () => {
			expect(formatDeletionReason(undefined)).toBe("");
		});

		it("should return empty string for empty string", () => {
			expect(formatDeletionReason("")).toBe("");
		});
	});
});

describe("formatCaretakerReason", () => {
	describe("when given reasons", () => {
		it("should capitalize first letter", () => {
			expect(formatCaretakerReason("on leave")).toBe("On leave");
		});

		it("should handle already capitalized reason", () => {
			expect(formatCaretakerReason("On Leave")).toBe("On Leave");
		});

		it("should handle single word", () => {
			expect(formatCaretakerReason("vacation")).toBe("Vacation");
		});
	});

	describe("when given edge cases", () => {
		it("should return empty string for undefined", () => {
			expect(formatCaretakerReason(undefined)).toBe("");
		});

		it("should return empty string for empty string", () => {
			expect(formatCaretakerReason("")).toBe("");
		});
	});
});

describe("buildAdminTaskDetails", () => {
	describe("when action is 'setcaretaker'", () => {
		it("should build caretaker details with reason", () => {
			const task: IAdminTask = {
				id: 1,
				action: "setcaretaker",
				status: "pending",
				requester: {
					id: 1,
					display_first_name: "Admin",
					display_last_name: "User",
					email: "admin@example.com",
				},
				primary_user: {
					id: 2,
					display_first_name: "John",
					display_last_name: "Doe",
					email: "john@example.com",
				},
				secondary_users: [
					{
						id: 3,
						display_first_name: "Jane",
						display_last_name: "Smith",
						email: "jane@example.com",
					},
				],
				reason: "on leave",
				created_at: "2024-01-01T00:00:00Z",
				updated_at: "2024-01-01T00:00:00Z",
			};

			const result = buildAdminTaskDetails(task);
			expect(result).toBe(
				"On leave: Set Jane Smith as caretaker for John Doe"
			);
		});

		it("should build caretaker details without reason", () => {
			const task: IAdminTask = {
				id: 1,
				action: "setcaretaker",
				status: "pending",
				requester: {
					id: 1,
					display_first_name: "Admin",
					display_last_name: "User",
					email: "admin@example.com",
				},
				primary_user: {
					id: 2,
					display_first_name: "John",
					display_last_name: "Doe",
					email: "john@example.com",
				},
				secondary_users: [
					{
						id: 3,
						display_first_name: "Jane",
						display_last_name: "Smith",
						email: "jane@example.com",
					},
				],
				created_at: "2024-01-01T00:00:00Z",
				updated_at: "2024-01-01T00:00:00Z",
			};

			const result = buildAdminTaskDetails(task);
			expect(result).toBe("Set Jane Smith as caretaker for John Doe");
		});
	});

	describe("when action is 'mergeuser'", () => {
		it("should build merge user details with reason", () => {
			const task: IAdminTask = {
				id: 1,
				action: "mergeuser",
				status: "pending",
				requester: {
					id: 1,
					display_first_name: "Admin",
					display_last_name: "User",
					email: "admin@example.com",
				},
				secondary_users: [
					{
						id: 2,
						display_first_name: "John",
						display_last_name: "Doe",
						email: "john@example.com",
					},
				],
				reason: "duplicate account",
				created_at: "2024-01-01T00:00:00Z",
				updated_at: "2024-01-01T00:00:00Z",
			};

			const result = buildAdminTaskDetails(task);
			expect(result).toBe(
				"Duplicate account: Merge John Doe (ID: 2) into requester's account"
			);
		});

		it("should build merge user details without reason", () => {
			const task: IAdminTask = {
				id: 1,
				action: "mergeuser",
				status: "pending",
				requester: {
					id: 1,
					display_first_name: "Admin",
					display_last_name: "User",
					email: "admin@example.com",
				},
				secondary_users: [
					{
						id: 2,
						display_first_name: "John",
						display_last_name: "Doe",
						email: "john@example.com",
					},
				],
				created_at: "2024-01-01T00:00:00Z",
				updated_at: "2024-01-01T00:00:00Z",
			};

			const result = buildAdminTaskDetails(task);
			expect(result).toBe("Merge John Doe (ID: 2) into requester's account");
		});
	});

	describe("when action is 'deleteproject'", () => {
		it("should format deletion reason", () => {
			const task: IAdminTask = {
				id: 1,
				action: "deleteproject",
				status: "pending",
				requester: {
					id: 1,
					display_first_name: "Admin",
					display_last_name: "User",
					email: "admin@example.com",
				},
				reason: "duplicate",
				created_at: "2024-01-01T00:00:00Z",
				updated_at: "2024-01-01T00:00:00Z",
			};

			const result = buildAdminTaskDetails(task);
			expect(result).toBe("Duplicate project");
		});

		it("should return default message without reason", () => {
			const task: IAdminTask = {
				id: 1,
				action: "deleteproject",
				status: "pending",
				requester: {
					id: 1,
					display_first_name: "Admin",
					display_last_name: "User",
					email: "admin@example.com",
				},
				created_at: "2024-01-01T00:00:00Z",
				updated_at: "2024-01-01T00:00:00Z",
			};

			const result = buildAdminTaskDetails(task);
			expect(result).toBe("Delete project request");
		});
	});

	describe("when given edge cases", () => {
		it("should return reason if provided for unknown action", () => {
			const task = {
				id: 1,
				action: "unknown" as AdminTaskAction,
				status: "pending" as const,
				requester: {
					id: 1,
					display_first_name: "Admin",
					display_last_name: "User",
					email: "admin@example.com",
				},
				reason: "Some reason",
				created_at: "2024-01-01T00:00:00Z",
				updated_at: "2024-01-01T00:00:00Z",
			};

			const result = buildAdminTaskDetails(task as IAdminTask);
			expect(result).toBe("Some reason");
		});

		it("should return default message for unknown action without reason", () => {
			const task = {
				id: 1,
				action: "unknown" as AdminTaskAction,
				status: "pending" as const,
				requester: {
					id: 1,
					display_first_name: "Admin",
					display_last_name: "User",
					email: "admin@example.com",
				},
				created_at: "2024-01-01T00:00:00Z",
				updated_at: "2024-01-01T00:00:00Z",
			};

			const result = buildAdminTaskDetails(task as IAdminTask);
			expect(result).toBe("No reason provided");
		});
	});
});
