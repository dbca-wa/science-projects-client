import { describe, it, expect } from "vitest";
import { userDetailKeys } from "./useUserDetail";

describe("userDetailKeys", () => {
	it("should generate base key for all user details", () => {
		expect(userDetailKeys.all).toEqual(["users", "detail"]);
	});

	it("should generate detail key with user ID", () => {
		expect(userDetailKeys.detail(42)).toEqual(["users", "detail", 42]);
	});

	it("should produce hierarchical keys", () => {
		const key = userDetailKeys.detail(1);
		expect(key[0]).toBe("users");
		expect(key[1]).toBe("detail");
	});
});
