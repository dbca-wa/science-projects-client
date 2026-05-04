import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { commentKeys } from "./useComments";
import { reactionKeys } from "./useReactions";
import { projectMapKeys } from "./useProjectsForMap";

// Mock all service dependencies
vi.mock("../services/project.service", () => ({
	createProject: vi.fn().mockResolvedValue({ id: 1 }),
	updateProject: vi.fn().mockResolvedValue({ id: 1 }),
	deleteProject: vi.fn().mockResolvedValue(undefined),
	updateProjectStatus: vi.fn().mockResolvedValue({ id: 1 }),
	getProjectById: vi.fn().mockResolvedValue({ project: { id: 1 } }),
	getAllProjects: vi.fn().mockResolvedValue({ projects: [] }),
	getMyProjects: vi.fn().mockResolvedValue([]),
	getProjectsForMap: vi.fn().mockResolvedValue({ projects: [] }),
	getInvolvedProjects: vi.fn().mockResolvedValue([]),
	getAllProjectYears: vi.fn().mockResolvedValue([]),
	uploadMethodologyImage: vi.fn(),
	updateMethodologyImage: vi.fn(),
	deleteMethodologyImage: vi.fn(),
	updateProjectDescription: vi.fn(),
	updateExternalProjectField: vi.fn(),
	updateConceptPlanField: vi.fn(),
	updateProjectPlanField: vi.fn(),
	updateProjectPlanEndorsementField: vi.fn(),
	updateProgressReportField: vi.fn(),
	updateStudentReportField: vi.fn(),
	updateProjectClosureField: vi.fn(),
}));

vi.mock("../services/team.service", () => ({
	getProjectTeam: vi.fn().mockResolvedValue([]),
	inviteTeamMember: vi.fn().mockResolvedValue({}),
	removeTeamMember: vi.fn().mockResolvedValue(undefined),
	updateTeamMember: vi.fn().mockResolvedValue({}),
	promoteToLeader: vi.fn().mockResolvedValue(undefined),
	updateTeamPositions: vi.fn().mockResolvedValue([]),
}));

vi.mock("../services/comment.service", () => ({
	getComments: vi.fn().mockResolvedValue([]),
	createComment: vi.fn().mockResolvedValue({ id: 1 }),
	updateComment: vi.fn().mockResolvedValue({ id: 1 }),
	deleteComment: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../services/reaction.service", () => ({
	getReactions: vi.fn().mockResolvedValue([]),
	toggleReaction: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/shared/services/document.service", () => ({
	performDocumentAction: vi.fn().mockResolvedValue({}),
	deleteDocument: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
		dismiss: vi.fn(),
	},
}));

vi.mock("react-router", () => ({
	useNavigate: () => vi.fn(),
	useParams: () => ({ id: "1" }),
}));

vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({ data: { id: 1 } }),
}));

const createWrapper = () => {
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) =>
		createElement(QueryClientProvider, { client: qc }, children);
};

describe("Project hook query keys", () => {
	describe("commentKeys", () => {
		it("should generate base key", () => {
			expect(commentKeys.all).toEqual(["comments"]);
		});
		it("should generate list key for document", () => {
			const key = commentKeys.list(100);
			expect(key).toContain(100);
		});
	});

	describe("reactionKeys", () => {
		it("should generate base key", () => {
			expect(reactionKeys.all).toEqual(["reactions"]);
		});
		it("should generate list key for comment", () => {
			const key = reactionKeys.list(42);
			expect(key).toContain(42);
		});
	});

	describe("projectMapKeys", () => {
		it("should generate base key", () => {
			expect(projectMapKeys.all).toEqual(["projects", "map"]);
		});
	});
});

describe("Project mutation hooks", () => {
	it("useUpdateProject should return a mutation", async () => {
		const { useUpdateProject } = await import("./useUpdateProject");
		const { result } = renderHook(() => useUpdateProject(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useDeleteProject should return a mutation", async () => {
		const { useDeleteProject } = await import("./useDeleteProject");
		const { result } = renderHook(() => useDeleteProject(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useCloseProject should return a mutation", async () => {
		const { useCloseProject } = await import("./useCloseProject");
		const { result } = renderHook(() => useCloseProject(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useSetProjectStatus should return a mutation", async () => {
		const { useSetProjectStatus } = await import("./useSetProjectStatus");
		const { result } = renderHook(() => useSetProjectStatus(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useRemoveTeamMember should return a mutation", async () => {
		const { useRemoveTeamMember } = await import("./useRemoveTeamMember");
		const { result } = renderHook(() => useRemoveTeamMember(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useSetTeamLeader should return a mutation", async () => {
		const { useSetTeamLeader } = await import("./useSetTeamLeader");
		const { result } = renderHook(() => useSetTeamLeader(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useMyProjects should return a query", async () => {
		const { useMyProjects } = await import("./useMyProjects");
		const { result } = renderHook(() => useMyProjects(), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});
});
