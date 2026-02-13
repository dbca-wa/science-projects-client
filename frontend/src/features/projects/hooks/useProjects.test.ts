import { describe, it, expect } from "vitest";
import { projectKeys } from "./useProjects";

describe("projectKeys", () => {
	it("should generate correct query key for all projects", () => {
		expect(projectKeys.all).toEqual(["projects"]);
	});

	it("should generate correct query key for lists", () => {
		expect(projectKeys.lists()).toEqual(["projects", "list"]);
	});

	it("should generate correct query key for list with params", () => {
		const params = {
			page: 1,
			searchTerm: "test",
			businessarea: "1",
		};
		expect(projectKeys.list(params)).toEqual(["projects", "list", params]);
	});

	it("should generate correct query key for details", () => {
		expect(projectKeys.details()).toEqual(["projects", "detail"]);
	});

	it("should generate correct query key for detail with id", () => {
		expect(projectKeys.detail(123)).toEqual(["projects", "detail", 123]);
		expect(projectKeys.detail("456")).toEqual(["projects", "detail", "456"]);
	});

	it("should generate hierarchical query keys", () => {
		// Verify that list keys include the base "projects" key
		const listKey = projectKeys.list({ page: 1 });
		expect(listKey[0]).toBe("projects");
		expect(listKey[1]).toBe("list");

		// Verify that detail keys include the base "projects" key
		const detailKey = projectKeys.detail(123);
		expect(detailKey[0]).toBe("projects");
		expect(detailKey[1]).toBe("detail");
	});
});
