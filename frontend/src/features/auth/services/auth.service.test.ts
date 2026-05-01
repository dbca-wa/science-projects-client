import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { logInOrdinary, logOut, getSSOMe } from "./auth.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

describe("auth.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("logInOrdinary", () => {
		it("should fetch CSRF cookie then POST credentials to login endpoint", async () => {
			const mockResponse = { ok: true, token: "abc" };
			(apiClient.get as Mock).mockResolvedValue(undefined);
			(apiClient.post as Mock).mockResolvedValue(mockResponse);

			const result = await logInOrdinary({
				username: "testuser",
				password: "testpass",
			});

			// First call: GET to fetch CSRF cookie
			expect(apiClient.get).toHaveBeenCalledWith("users/log-in");
			// Second call: POST with credentials
			expect(apiClient.post).toHaveBeenCalledWith("users/log-in", {
				username: "testuser",
				password: "testpass",
			});
			expect(result).toEqual(mockResponse);
		});

		it("should throw when response is not ok", async () => {
			(apiClient.get as Mock).mockResolvedValue(undefined);
			(apiClient.post as Mock).mockResolvedValue({ ok: false });

			await expect(
				logInOrdinary({ username: "bad", password: "creds" })
			).rejects.toThrow("Please check your credentials and try again.");
		});
	});

	describe("logOut", () => {
		it("should POST to logout endpoint", async () => {
			const mockResponse = { ok: "logged out" };
			(apiClient.post as Mock).mockResolvedValue(mockResponse);

			const result = await logOut();

			expect(apiClient.post).toHaveBeenCalledWith("users/log-out");
			expect(result).toEqual(mockResponse);
		});
	});

	describe("getSSOMe", () => {
		it("should GET current user from me endpoint", async () => {
			const mockUser = { id: 1, username: "ssouser" };
			(apiClient.get as Mock).mockResolvedValue(mockUser);

			const result = await getSSOMe();

			expect(apiClient.get).toHaveBeenCalledWith("users/me");
			expect(result).toEqual(mockUser);
		});
	});
});
