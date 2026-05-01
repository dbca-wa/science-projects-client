import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

vi.mock("../services/project.service", () => ({
	getAllProjects: vi.fn().mockResolvedValue({ projects: [] }),
	getProjectById: vi.fn().mockResolvedValue({}),
	createProject: vi.fn().mockResolvedValue({ id: 1 }),
	updateProject: vi.fn().mockResolvedValue({}),
	deleteProject: vi.fn().mockResolvedValue(undefined),
	updateProjectStatus: vi.fn().mockResolvedValue({}),
	getMyProjects: vi.fn().mockResolvedValue([]),
	getProjectsForMap: vi.fn().mockResolvedValue({ projects: [] }),
	getAllProjectYears: vi.fn().mockResolvedValue([]),
	getInvolvedProjects: vi.fn().mockResolvedValue([]),
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

describe("Remaining project hooks", () => {
	it("useReopenProject should return a mutation", async () => {
		const mod = await import("./useReopenProject");
		const { result } = renderHook(() => mod.useReopenProject(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useSuspendProject should return a mutation", async () => {
		const mod = await import("./useSuspendProject");
		const { result } = renderHook(() => mod.useSuspendProject(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useSetProjectAreas should return a mutation", async () => {
		const mod = await import("./useSetProjectAreas");
		const { result } = renderHook(() => mod.useSetProjectAreas(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useUpdateTeamMember should return a mutation", async () => {
		const mod = await import("./useUpdateTeamMember");
		const { result } = renderHook(() => mod.useUpdateTeamMember(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useUpdateTeamPositions should return a mutation", async () => {
		const mod = await import("./useUpdateTeamPositions");
		const { result } = renderHook(() => mod.useUpdateTeamPositions(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useRequestDeleteProject should return a mutation", async () => {
		const mod = await import("./useRequestDeleteProject");
		const { result } = renderHook(() => mod.useRequestDeleteProject(), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useCancelDeletionRequest should return a mutation", async () => {
		const mod = await import("./useCancelDeletionRequest");
		const { result } = renderHook(() => mod.useCancelDeletionRequest(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});

	it("useProjectTeam should return a query", async () => {
		const mod = await import("./useProjectTeam");
		const { result } = renderHook(() => mod.useProjectTeam(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useInvolvedProjects should return a query", async () => {
		const mod = await import("./useInvolvedProjects");
		const { result } = renderHook(() => mod.useInvolvedProjects(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.isLoading).toBeDefined();
	});

	it("useToggleProfileVisibility should return a mutation", async () => {
		const mod = await import("./useToggleProfileVisibility");
		const { result } = renderHook(() => mod.useToggleProfileVisibility(1), {
			wrapper: createWrapper(),
		});
		expect(result.current.mutate).toBeDefined();
	});
});
