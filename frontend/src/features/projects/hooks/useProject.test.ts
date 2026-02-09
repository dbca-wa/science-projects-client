import { describe, it, expect } from "vitest";
import { projectKeys } from "./useProjects";

describe("useProject query keys", () => {
	it("should use correct query key structure", () => {
		const projectId = 123;
		const queryKey = projectKeys.detail(projectId);
		
		expect(queryKey).toEqual(["projects", "detail", 123]);
	});

	it("should handle string project IDs", () => {
		const projectId = "456";
		const queryKey = projectKeys.detail(projectId);
		
		expect(queryKey).toEqual(["projects", "detail", "456"]);
	});

	it("should maintain hierarchical structure", () => {
		const queryKey = projectKeys.detail(789);
		
		// Should start with base "projects" key
		expect(queryKey[0]).toBe("projects");
		// Should include "detail" namespace
		expect(queryKey[1]).toBe("detail");
		// Should include the ID
		expect(queryKey[2]).toBe(789);
	});
});
