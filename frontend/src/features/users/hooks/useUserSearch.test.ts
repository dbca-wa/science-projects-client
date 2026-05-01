import { describe, it, expect } from "vitest";
import { userSearchKeys } from "./useUserSearch";

describe("userSearchKeys", () => {
	it("should generate base key for all user searches", () => {
		expect(userSearchKeys.all).toEqual(["users", "search"]);
	});

	it("should generate search key with term, filters, and page", () => {
		const key = userSearchKeys.search("john", { roleFilter: "staff" }, 2);
		expect(key).toEqual([
			"users",
			"search",
			"john",
			{ roleFilter: "staff" },
			2,
		]);
	});

	it("should generate search key with empty term", () => {
		const key = userSearchKeys.search("", {}, 1);
		expect(key).toEqual(["users", "search", "", {}, 1]);
	});

	it("should produce hierarchical keys (search keys start with base)", () => {
		const searchKey = userSearchKeys.search("test", {}, 1);
		expect(searchKey[0]).toBe("users");
		expect(searchKey[1]).toBe("search");
	});
});
