import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AuthStore } from "./auth.store";
import { getSSOMe } from "@/features/auth/services/auth.service";
import Cookie from "js-cookie";
import { logger } from "@/shared/services/logger.service";
import type { IUserMe } from "@/shared/types/user.types";

vi.mock("@/features/auth/services/auth.service");
vi.mock("js-cookie");
vi.mock("@/shared/services/logger.service");

describe("AuthStore.initialise", () => {
	let authStore: AuthStore;
	const mockGetSSOMe = getSSOMe as ReturnType<typeof vi.fn>;
	const mockCookieGet = Cookie.get as ReturnType<typeof vi.fn>;
	const mockCookieRemove = Cookie.remove as ReturnType<typeof vi.fn>;

	const mockUser: Partial<IUserMe> & { id: number } = {
		id: 1,
		username: "testuser",
		email: "test@example.com",
		first_name: "Test",
		last_name: "User",
		display_first_name: "Test",
		display_last_name: "User",
		is_superuser: false,
		is_staff: false,
		phone: "",
		image: { id: 1, file: "", old_file: "", user: 1 },
		title: "",
		agency: { id: 1, name: "Test Agency", key_stakeholder: 1, is_active: true },
	};

	beforeEach(() => {
		authStore = new AuthStore();
		vi.clearAllMocks();

		// Mock logger methods
		vi.mocked(logger.info).mockImplementation(() => {});
		vi.mocked(logger.warn).mockImplementation(() => {});
		vi.mocked(logger.error).mockImplementation(() => {});
	});

	afterEach(() => {
		authStore.dispose();
	});

	describe("No CSRF token", () => {
		it("should set not authenticated when no CSRF token", async () => {
			mockCookieGet.mockReturnValue(undefined);

			await authStore.initialise();

			expect(authStore.isAuthenticated).toBe(false);
			expect(authStore.state.initialised).toBe(true);
			expect(authStore.user).toBe(null);
			expect(mockGetSSOMe).not.toHaveBeenCalled();
			expect(logger.info).toHaveBeenCalledWith(
				"No CSRF token - not authenticated"
			);
		});
	});

	describe("Valid session", () => {
		it("should set authenticated when CSRF exists and session valid", async () => {
			mockCookieGet.mockReturnValue("csrf-token");
			mockGetSSOMe.mockResolvedValue(mockUser);

			await authStore.initialise();

			expect(authStore.isAuthenticated).toBe(true);
			expect(authStore.user).toEqual(mockUser);
			expect(authStore.state.initialised).toBe(true);
			expect(mockGetSSOMe).toHaveBeenCalledTimes(1);
			expect(logger.info).toHaveBeenCalledWith(
				"Session validated successfully",
				{
					userId: mockUser.id,
					username: mockUser.username,
				}
			);
		});
	});

	describe("Invalid session - 401", () => {
		it("should logout when CSRF exists but session returns 401", async () => {
			mockCookieGet.mockReturnValue("csrf-token");
			mockGetSSOMe.mockRejectedValue({
				status: 401,
				message: "Unauthorised",
			});

			const logoutSpy = vi.spyOn(authStore, "logout");

			await authStore.initialise();

			expect(logoutSpy).toHaveBeenCalled();
			expect(authStore.isAuthenticated).toBe(false);
			expect(authStore.user).toBe(null);
			expect(authStore.state.initialised).toBe(true);
			expect(mockCookieRemove).toHaveBeenCalledWith("sessionid");
			expect(mockCookieRemove).toHaveBeenCalledWith("spmscsrf");
			expect(mockCookieRemove).toHaveBeenCalledWith("csrf");
			expect(logger.warn).toHaveBeenCalledWith(
				"Session invalid - clearing auth state",
				{ status: 401 }
			);
		});
	});

	describe("Invalid session - 403", () => {
		it("should logout when CSRF exists but session returns 403", async () => {
			mockCookieGet.mockReturnValue("csrf-token");
			mockGetSSOMe.mockRejectedValue({
				status: 403,
				message: "Forbidden",
			});

			const logoutSpy = vi.spyOn(authStore, "logout");

			await authStore.initialise();

			expect(logoutSpy).toHaveBeenCalled();
			expect(authStore.isAuthenticated).toBe(false);
			expect(authStore.user).toBe(null);
			expect(authStore.state.initialised).toBe(true);
			expect(mockCookieRemove).toHaveBeenCalledWith("sessionid");
			expect(mockCookieRemove).toHaveBeenCalledWith("spmscsrf");
			expect(mockCookieRemove).toHaveBeenCalledWith("csrf");
			expect(logger.warn).toHaveBeenCalledWith(
				"Session invalid - clearing auth state",
				{ status: 403 }
			);
		});
	});

	describe("Network errors", () => {
		it("should set not authenticated on network error without clearing cookies", async () => {
			mockCookieGet.mockReturnValue("csrf-token");
			mockGetSSOMe.mockRejectedValue(new Error("Network error"));

			const logoutSpy = vi.spyOn(authStore, "logout");

			await authStore.initialise();

			expect(logoutSpy).not.toHaveBeenCalled();
			expect(authStore.isAuthenticated).toBe(false);
			expect(authStore.state.initialised).toBe(true);
			expect(mockCookieRemove).not.toHaveBeenCalled();
			expect(logger.error).toHaveBeenCalledWith(
				"Network error during session validation",
				{ error: expect.any(Error) }
			);
		});
	});

	describe("Other API errors", () => {
		it("should set not authenticated on 500 error without clearing cookies", async () => {
			mockCookieGet.mockReturnValue("csrf-token");
			mockGetSSOMe.mockRejectedValue({
				status: 500,
				message: "Server error",
			});

			const logoutSpy = vi.spyOn(authStore, "logout");

			await authStore.initialise();

			expect(logoutSpy).not.toHaveBeenCalled();
			expect(authStore.isAuthenticated).toBe(false);
			expect(authStore.state.initialised).toBe(true);
			expect(mockCookieRemove).not.toHaveBeenCalled();
			expect(logger.error).toHaveBeenCalledWith("Session validation error", {
				status: 500,
				message: "Server error",
			});
		});

		it("should set not authenticated on 404 error without clearing cookies", async () => {
			mockCookieGet.mockReturnValue("csrf-token");
			mockGetSSOMe.mockRejectedValue({
				status: 404,
				message: "Not found",
			});

			const logoutSpy = vi.spyOn(authStore, "logout");

			await authStore.initialise();

			expect(logoutSpy).not.toHaveBeenCalled();
			expect(authStore.isAuthenticated).toBe(false);
			expect(authStore.state.initialised).toBe(true);
			expect(mockCookieRemove).not.toHaveBeenCalled();
		});
	});

	describe("Initialised flag", () => {
		it("should always set initialised flag on success", async () => {
			mockCookieGet.mockReturnValue("csrf-token");
			mockGetSSOMe.mockResolvedValue(mockUser);

			await authStore.initialise();

			expect(authStore.state.initialised).toBe(true);
		});

		it("should always set initialised flag on auth error", async () => {
			mockCookieGet.mockReturnValue("csrf-token");
			mockGetSSOMe.mockRejectedValue({ status: 401, message: "Unauthorised" });

			await authStore.initialise();

			expect(authStore.state.initialised).toBe(true);
		});

		it("should always set initialised flag on network error", async () => {
			mockCookieGet.mockReturnValue("csrf-token");
			mockGetSSOMe.mockRejectedValue(new Error("Network error"));

			await authStore.initialise();

			expect(authStore.state.initialised).toBe(true);
		});

		it("should always set initialised flag when no CSRF", async () => {
			mockCookieGet.mockReturnValue(undefined);

			await authStore.initialise();

			expect(authStore.state.initialised).toBe(true);
		});
	});

	describe("Edge cases", () => {
		it("should handle undefined error gracefully", async () => {
			mockCookieGet.mockReturnValue("csrf-token");
			mockGetSSOMe.mockRejectedValue(undefined);

			await authStore.initialise();

			expect(authStore.isAuthenticated).toBe(false);
			expect(authStore.state.initialised).toBe(true);
		});

		it("should handle null error gracefully", async () => {
			mockCookieGet.mockReturnValue("csrf-token");
			mockGetSSOMe.mockRejectedValue(null);

			await authStore.initialise();

			expect(authStore.isAuthenticated).toBe(false);
			expect(authStore.state.initialised).toBe(true);
		});

		it("should handle error without status property", async () => {
			mockCookieGet.mockReturnValue("csrf-token");
			mockGetSSOMe.mockRejectedValue({ message: "Some error" });

			await authStore.initialise();

			expect(authStore.isAuthenticated).toBe(false);
			expect(authStore.state.initialised).toBe(true);
		});
	});
});

describe("AuthStore other methods", () => {
	let authStore: AuthStore;
	const mockCookieGet = Cookie.get as ReturnType<typeof vi.fn>;
	const mockCookieRemove = Cookie.remove as ReturnType<typeof vi.fn>;

	beforeEach(() => {
		authStore = new AuthStore();
		vi.clearAllMocks();
	});

	afterEach(() => {
		authStore.dispose();
	});

	describe("setUser", () => {
		it("should set user and authenticated state", () => {
			const mockUser: Partial<IUserMe> & { id: number } = {
				id: 1,
				username: "testuser",
				email: "test@example.com",
				first_name: "Test",
				last_name: "User",
				display_first_name: "Test",
				display_last_name: "User",
				is_superuser: false,
				is_staff: false,
				phone: "",
				image: { id: 1, file: "", old_file: "", user: 1 },
				title: "",
				agency: {
					id: 1,
					name: "Test Agency",
					key_stakeholder: 1,
					is_active: true,
				},
			};

			mockCookieGet.mockReturnValue("csrf-token");

			authStore.setUser(mockUser as IUserMe);

			expect(authStore.user).toEqual(mockUser);
			expect(authStore.isAuthenticated).toBe(true);
		});

		it("should set authenticated based on CSRF when user is null", () => {
			mockCookieGet.mockReturnValue("csrf-token");

			authStore.setUser(null);

			expect(authStore.user).toBe(null);
			expect(authStore.isAuthenticated).toBe(true); // Still true because CSRF exists
		});

		it("should set not authenticated when no user and no CSRF", () => {
			mockCookieGet.mockReturnValue(undefined);

			authStore.setUser(null);

			expect(authStore.user).toBe(null);
			expect(authStore.isAuthenticated).toBe(false);
		});
	});

	describe("logout", () => {
		it("should clear user and cookies", () => {
			authStore.logout();

			expect(authStore.isAuthenticated).toBe(false);
			expect(authStore.user).toBe(null);
			expect(mockCookieRemove).toHaveBeenCalledWith("sessionid");
			expect(mockCookieRemove).toHaveBeenCalledWith("spmscsrf");
			expect(mockCookieRemove).toHaveBeenCalledWith("csrf");
		});
	});

	describe("handleUnauthorised", () => {
		it("should call logout", () => {
			const logoutSpy = vi.spyOn(authStore, "logout");

			authStore.handleUnauthorised();

			expect(logoutSpy).toHaveBeenCalled();
		});
	});

	describe("isSuperuser", () => {
		it("should return true when user is superuser", () => {
			const mockUser: Partial<IUserMe> & { id: number } = {
				id: 1,
				username: "admin",
				email: "admin@example.com",
				first_name: "Admin",
				last_name: "User",
				display_first_name: "Admin",
				display_last_name: "User",
				is_superuser: true,
				is_staff: true,
				phone: "",
				image: { id: 1, file: "", old_file: "", user: 1 },
				title: "",
				agency: {
					id: 1,
					name: "Test Agency",
					key_stakeholder: 1,
					is_active: true,
				},
			};

			authStore.user = mockUser as IUserMe;

			expect(authStore.isSuperuser).toBe(true);
		});

		it("should return false when user is not superuser", () => {
			const mockUser: Partial<IUserMe> & { id: number } = {
				id: 1,
				username: "user",
				email: "user@example.com",
				first_name: "Regular",
				last_name: "User",
				display_first_name: "Regular",
				display_last_name: "User",
				is_superuser: false,
				is_staff: false,
				phone: "",
				image: { id: 1, file: "", old_file: "", user: 1 },
				title: "",
				agency: {
					id: 1,
					name: "Test Agency",
					key_stakeholder: 1,
					is_active: true,
				},
			};

			authStore.user = mockUser as IUserMe;

			expect(authStore.isSuperuser).toBe(false);
		});

		it("should return false when user is null", () => {
			authStore.user = null;

			expect(authStore.isSuperuser).toBe(false);
		});
	});
});
