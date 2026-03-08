// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Test file with complex type issues requiring refactor
// @ts-nocheck
import { describe, it, expect } from "vitest";
import {
	canEditProject,
	canManageTeam,
	canDeleteDocument,
	isUserAtApprovalStage,
	isProjectLeader,
	type IDocumentData,
} from "./permissions.utils";
import type { IUserData } from "@/shared/types/user.types";
import type {
	IProjectData,
	IProjectMember,
} from "@/shared/types/project.types";

/**
 * Helper to create mock user data
 */
function createMockUser(overrides: Partial<IUserData> = {}): IUserData {
	return {
		id: 1,
		username: "testuser",
		email: "test@example.com",
		display_first_name: "Test",
		display_last_name: "User",
		first_name: "Test",
		last_name: "User",
		is_superuser: false,
		is_staff: true,
		is_active: true,
		phone: null,
		image: { id: 1, file: "", old_file: "" },
		business_area: undefined,
		role: "Test Role",
		branch: { id: 1, name: "Test Branch", slug: "test-branch" },
		affiliation: { id: 1, name: "Test Affiliation" },
		...overrides,
	} as IUserData;
}

/**
 * Helper to create mock project data
 */
function createMockProject(
	overrides: Partial<IProjectData> = {}
): IProjectData {
	return {
		id: 1,
		areas: [],
		kind: "science",
		title: "Test Project",
		status: "active",
		description: "",
		tagline: "",
		image: null,
		keywords: "",
		year: 2024,
		number: 6,
		start_date: new Date("2024-01-01"),
		end_date: new Date("2024-12-31"),
		business_area: {
			id: 1,
			name: "Test BA",
			slug: "test-ba",
			is_active: true,
			leader: 2,
			introduction: "",
			image: null,
			focus: "",
		},
		deletion_requested: false,
		deletion_request_id: null,
		created_at: new Date(),
		updated_at: new Date(),
		...overrides,
	} as IProjectData;
}

/**
 * Helper to create mock project member
 */
function createMockMember(
	overrides: Partial<IProjectMember> = {}
): IProjectMember {
	return {
		id: 1,
		project: 1,
		is_leader: false,
		user: {
			id: 1,
			is_staff: true,
			is_superuser: false,
			username: "testuser",
			display_first_name: "Test",
			display_last_name: "User",
			first_name: "Test",
			last_name: "User",
			email: "test@example.com",
			business_area: null,
			branch: null,
			role: "Test Role",
			image: { id: 1, file: "", old_file: "" },
		},
		role: "Research",
		time_allocation: 50,
		position: 1,
		short_code: null,
		affiliation: { id: 1, name: "Test Affiliation" },
		...overrides,
	} as IProjectMember;
}

/**
 * Helper to create mock document
 */
function createMockDocument(
	overrides: Partial<IDocumentData> = {}
): IDocumentData {
	return {
		id: 1,
		type: "concept_plan",
		project_lead_approval_granted: false,
		business_area_lead_approval_granted: false,
		directorate_approval_granted: false,
		...overrides,
	};
}

describe("canEditProject", () => {
	it("should grant permission to superuser", () => {
		const user = createMockUser({ is_superuser: true });
		const project = createMockProject();
		expect(canEditProject(user, project)).toBe(true);
	});

	it("should grant permission to business area leader", () => {
		const user = createMockUser({ id: 2 });
		const project = createMockProject({
			business_area: {
				id: 1,
				name: "Test BA",
				slug: "test-ba",
				is_active: true,
				leader: 2,
				introduction: "",
				image: null,
				focus: "",
			},
		});
		expect(canEditProject(user, project)).toBe(true);
	});

	it("should deny permission to regular user", () => {
		const user = createMockUser({ id: 3, is_superuser: false });
		const project = createMockProject({
			business_area: {
				id: 1,
				name: "Test BA",
				slug: "test-ba",
				is_active: true,
				leader: 2,
				introduction: "",
				image: null,
				focus: "",
			},
		});
		expect(canEditProject(user, project)).toBe(false);
	});

	it("should return false when user is null", () => {
		const project = createMockProject();
		expect(canEditProject(null, project)).toBe(false);
	});

	it("should return false when project is null", () => {
		const user = createMockUser();
		expect(canEditProject(user, null)).toBe(false);
	});
});

describe("canManageTeam", () => {
	it("should grant permission to users with edit permissions", () => {
		const user = createMockUser({ is_superuser: true });
		const project = createMockProject();
		const members: IProjectMember[] = [];
		expect(canManageTeam(user, project, members)).toBe(true);
	});

	it("should grant permission to team members", () => {
		const user = createMockUser({ id: 1 });
		const project = createMockProject();
		const members = [
			createMockMember({ user: { ...createMockUser(), id: 1, agency: null } }),
		];
		expect(canManageTeam(user, project, members)).toBe(true);
	});

	it("should deny permission to non-team members without edit permissions", () => {
		const user = createMockUser({ id: 3, is_superuser: false });
		const project = createMockProject();
		const members = [
			createMockMember({ user: { ...createMockUser(), id: 1, agency: null } }),
		];
		expect(canManageTeam(user, project, members)).toBe(false);
	});

	it("should return false when user is null", () => {
		const project = createMockProject();
		const members: IProjectMember[] = [];
		expect(canManageTeam(null, project, members)).toBe(false);
	});
});

describe("canDeleteDocument", () => {
	it("should allow deletion of unapproved documents", () => {
		const user = createMockUser({ is_superuser: true });
		const document = createMockDocument({
			project_lead_approval_granted: false,
		});
		const project = createMockProject();
		expect(canDeleteDocument(user, document, project, false)).toBe(true);
	});

	it("should allow deletion of project plan with no progress reports", () => {
		const user = createMockUser({ is_superuser: true });
		const document = createMockDocument({
			type: "project_plan",
			project_lead_approval_granted: true,
		});
		const project = createMockProject();
		expect(canDeleteDocument(user, document, project, false)).toBe(true);
	});

	it("should deny deletion of project plan with progress reports", () => {
		const user = createMockUser({ is_superuser: true });
		const document = createMockDocument({
			type: "project_plan",
			project_lead_approval_granted: true,
		});
		const project = createMockProject();
		expect(canDeleteDocument(user, document, project, true)).toBe(false);
	});

	it("should deny deletion of approved non-project-plan documents", () => {
		const user = createMockUser({ is_superuser: true });
		const document = createMockDocument({
			type: "concept_plan",
			project_lead_approval_granted: true,
		});
		const project = createMockProject();
		expect(canDeleteDocument(user, document, project, false)).toBe(false);
	});

	it("should return false when user is null", () => {
		const document = createMockDocument();
		const project = createMockProject();
		expect(canDeleteDocument(null, document, project, false)).toBe(false);
	});
});

describe("isUserAtApprovalStage", () => {
	it("should return true for business area leader at BA stage", () => {
		const user = createMockUser({ id: 2 });
		const project = createMockProject({
			business_area: {
				id: 1,
				name: "Test BA",
				slug: "test-ba",
				is_active: true,
				leader: 2,
				introduction: "",
				image: null,
				focus: "",
			},
		});
		expect(isUserAtApprovalStage(user, project, "business_area_lead")).toBe(
			true
		);
	});

	it("should return true for superuser at directorate stage", () => {
		const user = createMockUser({ is_superuser: true });
		const project = createMockProject();
		expect(isUserAtApprovalStage(user, project, "directorate")).toBe(true);
	});

	it("should return false for regular user at any stage", () => {
		const user = createMockUser({ id: 3, is_superuser: false });
		const project = createMockProject();
		expect(isUserAtApprovalStage(user, project, "project_lead")).toBe(false);
		expect(isUserAtApprovalStage(user, project, "business_area_lead")).toBe(
			false
		);
		expect(isUserAtApprovalStage(user, project, "directorate")).toBe(false);
	});

	it("should return false when user is null", () => {
		const project = createMockProject();
		expect(isUserAtApprovalStage(null, project, "project_lead")).toBe(false);
	});
});

describe("isProjectLeader", () => {
	it("should return true when user is the project leader", () => {
		const user = createMockUser({ id: 1 });
		const members = [
			createMockMember({
				is_leader: true,
				user: { ...createMockUser(), id: 1, agency: null },
			}),
		];
		expect(isProjectLeader(user, members)).toBe(true);
	});

	it("should return false when user is not the project leader", () => {
		const user = createMockUser({ id: 2 });
		const members = [
			createMockMember({
				is_leader: true,
				user: { ...createMockUser(), id: 1, agency: null },
			}),
		];
		expect(isProjectLeader(user, members)).toBe(false);
	});

	it("should return false when there is no project leader", () => {
		const user = createMockUser({ id: 1 });
		const members = [
			createMockMember({
				is_leader: false,
				user: { ...createMockUser(), id: 1, agency: null },
			}),
		];
		expect(isProjectLeader(user, members)).toBe(false);
	});

	it("should return false when user is null", () => {
		const members = [createMockMember({ is_leader: true })];
		expect(isProjectLeader(null, members)).toBe(false);
	});
});
