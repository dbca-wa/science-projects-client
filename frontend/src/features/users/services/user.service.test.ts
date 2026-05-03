import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	getMe,
	getUsers,
	createUser,
	checkEmailExists,
	checkNameExists,
	toggleAdminStatus,
	activateUser,
	deactivateUser,
	deleteUser,
	requestMergeUsers,
	inviteUser,
	searchITAssets,
	toggleStaffProfileVisibility,
	updatePersonalInformation,
	updateMembership,
	removeUserAvatar,
} from "./user.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

// Mock the shared user service re-exports
vi.mock("@/shared/services/user.service", () => ({
	getUsersBasedOnSearchTerm: vi.fn(),
	getFullUser: vi.fn(),
}));

describe("user.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getMe", () => {
		it("should GET current user from me endpoint", async () => {
			const mockUser = { id: 1, username: "me" };
			(apiClient.get as Mock).mockResolvedValue(mockUser);

			const result = await getMe();

			expect(apiClient.get).toHaveBeenCalledWith("users/me");
			expect(result).toEqual(mockUser);
		});
	});

	describe("getUsers", () => {
		it("should GET all users from list endpoint", async () => {
			const mockUsers = [{ id: 1 }, { id: 2 }];
			(apiClient.get as Mock).mockResolvedValue(mockUsers);

			const result = await getUsers();

			expect(apiClient.get).toHaveBeenCalledWith("users/list");
			expect(result).toEqual(mockUsers);
		});
	});

	describe("createUser", () => {
		it("should POST user data to create endpoint", async () => {
			const mockCreated = { id: 3, username: "newuser" };
			(apiClient.post as Mock).mockResolvedValue(mockCreated);

			const formData = {
				username: "newuser",
				email: "new@example.com",
				firstName: "New",
				lastName: "User",
				isStaff: true,
				branch: 1,
				businessArea: 2,
				affiliation: 3,
			};

			const result = await createUser(formData);

			expect(apiClient.post).toHaveBeenCalledWith("users/list", {
				username: "newuser",
				email: "new@example.com",
				firstName: "New",
				lastName: "User",
				isStaff: true,
				branch: 1,
				businessArea: 2,
				affiliation: 3,
			});
			expect(result).toEqual(mockCreated);
		});
	});

	describe("checkEmailExists", () => {
		it("should GET email and return boolean", async () => {
			(apiClient.get as Mock).mockResolvedValue({ exists: true });

			const result = await checkEmailExists("test@example.com");

			expect(apiClient.get).toHaveBeenCalledWith("users/check-email-exists", {
				params: { email: "test@example.com" },
			});
			expect(result).toBe(true);
		});

		it("should return false when email does not exist", async () => {
			(apiClient.get as Mock).mockResolvedValue({ exists: false });

			const result = await checkEmailExists("new@example.com");
			expect(result).toBe(false);
		});
	});

	describe("checkNameExists", () => {
		it("should GET name and return boolean", async () => {
			(apiClient.get as Mock).mockResolvedValue({ exists: true });

			const result = await checkNameExists("John", "Doe");

			expect(apiClient.get).toHaveBeenCalledWith("users/check-name-exists", {
				params: { first_name: "John", last_name: "Doe" },
			});
			expect(result).toBe(true);
		});
	});

	describe("admin actions", () => {
		it("toggleAdminStatus should POST to admin endpoint", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);

			await toggleAdminStatus(42);

			expect(apiClient.post).toHaveBeenCalledWith("users/42/admin");
		});

		it("activateUser should POST to toggle active endpoint", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);

			await activateUser(42);

			expect(apiClient.post).toHaveBeenCalledWith("users/42/toggleactive");
		});

		it("deactivateUser should POST to toggle active endpoint", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);

			await deactivateUser(42);

			expect(apiClient.post).toHaveBeenCalledWith("users/42/toggleactive");
		});

		it("deleteUser should DELETE user by ID", async () => {
			(apiClient.delete as Mock).mockResolvedValue(undefined);

			await deleteUser(42);

			expect(apiClient.delete).toHaveBeenCalledWith("users/42");
		});

		it("requestMergeUsers should POST merge task", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);

			await requestMergeUsers(1, [2, 3]);

			expect(apiClient.post).toHaveBeenCalledWith("adminoptions/tasks", {
				action: "mergeuser",
				primary_user: 1,
				secondary_users: [2, 3],
			});
		});
	});

	describe("inviteUser", () => {
		it("should POST invite data to invite endpoint", async () => {
			const mockResponse = {
				email: "invite@example.com",
				first_name: "Invited",
				last_name: "User",
				invited: true,
			};
			(apiClient.post as Mock).mockResolvedValue(mockResponse);

			const result = await inviteUser({
				email: "invite@example.com",
				first_name: "Invited",
				last_name: "User",
			});

			expect(apiClient.post).toHaveBeenCalledWith("users/invite", {
				email: "invite@example.com",
				first_name: "Invited",
				last_name: "User",
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe("searchITAssets", () => {
		it("should GET IT assets with search query", async () => {
			const mockResults = [{ employee_id: "123", name: "Test" }];
			(apiClient.get as Mock).mockResolvedValue(mockResults);

			const result = await searchITAssets("test");

			expect(apiClient.get).toHaveBeenCalledWith("users/it-assets-search", {
				params: { q: "test" },
			});
			expect(result).toEqual(mockResults);
		});
	});

	describe("toggleStaffProfileVisibility", () => {
		it("should POST to toggle visibility endpoint", async () => {
			(apiClient.post as Mock).mockResolvedValue({ success: true });

			const result = await toggleStaffProfileVisibility(5);

			expect(apiClient.post).toHaveBeenCalledWith(
				"users/staffprofiles/5/toggle_visibility"
			);
			expect(result).toEqual({ success: true });
		});
	});

	describe("updatePersonalInformation", () => {
		it("should PUT personal info to user endpoint", async () => {
			(apiClient.put as Mock).mockResolvedValue(undefined);

			await updatePersonalInformation(42, {
				display_first_name: "Updated",
				display_last_name: "Name",
				phone: "1234",
			});

			expect(apiClient.put).toHaveBeenCalledWith("users/42/pi", {
				display_first_name: "Updated",
				display_last_name: "Name",
				phone: "1234",
			});
		});
	});

	describe("updateMembership", () => {
		it("should PUT membership data to user endpoint", async () => {
			(apiClient.put as Mock).mockResolvedValue(undefined);

			await updateMembership(42, {
				branch: 1,
				business_area: 2,
				affiliation: 3,
			});

			expect(apiClient.put).toHaveBeenCalledWith("users/42/membership", {
				branch: 1,
				business_area: 2,
				affiliation: 3,
			});
		});

		it("should send null for empty membership fields", async () => {
			(apiClient.put as Mock).mockResolvedValue(undefined);

			await updateMembership(42, {});

			expect(apiClient.put).toHaveBeenCalledWith("users/42/membership", {
				branch: null,
				business_area: null,
				affiliation: null,
			});
		});
	});

	describe("removeUserAvatar", () => {
		it("should POST to remove avatar endpoint", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);

			await removeUserAvatar(42);

			expect(apiClient.post).toHaveBeenCalledWith("users/42/remove_avatar");
		});
	});
});
