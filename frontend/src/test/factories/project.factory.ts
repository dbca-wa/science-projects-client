import type { IProjectData } from "@/shared/types/project.types";

/**
 * Create a mock project for testing
 * Provides sensible defaults with ability to override any field
 *
 * @example
 * // Create project with defaults
 * const project = createMockProject();
 *
 * // Override specific fields
 * const activeProject = createMockProject({ status: "active" });
 * const projectWithTitle = createMockProject({ title: "My Project" });
 */
export const createMockProject = (
	overrides?: Partial<IProjectData>
): IProjectData => ({
	id: 1,
	title: "Test Project",
	status: "active",
	year: 2024,
	tagline: "Test tagline",

	description: "Test project description",
	kind: "science" as const,
	keywords: "test, project",
	number: 1,
	tag: "SP-2024-001",
	deletion_requested: false,
	deletion_request_id: null,
	start_date: new Date("2024-01-01"),
	end_date: new Date("2024-12-31"),
	image: null,
	areas: [],
	business_area: {
		id: 1,
		name: "Test Business Area",
		leader: 1,
		slug: "test-ba",
		focus: "Test Focus",
		introduction: "Test Introduction",
		image: null,
		is_active: true,
	},
	created_at: new Date("2024-01-01T00:00:00Z"),
	updated_at: new Date("2024-01-01T00:00:00Z"),
	...overrides,
});
