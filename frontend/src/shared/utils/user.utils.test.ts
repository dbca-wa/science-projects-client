import { describe, it, expect } from "vitest";
import {
	getUserDisplayName,
	getUserInitials,
	hasValidEmail,
	getUserEmail,
	getUserPhone,
	toUserDisplayFormat,
	getCaretakerReasonLabel,
} from "./user.utils";
import {
	createMockUser,
	createMockUserWithoutEmail,
	createMockUserWithInvalidName,
} from "@/test/factories/user.factory";

describe("getUserDisplayName", () => {
	describe("when given valid display names", () => {
		it("should return full name when display names are valid", () => {
			const user = createMockUser({
				display_first_name: "John",
				display_last_name: "Doe",
			});

			expect(getUserDisplayName(user)).toBe("John Doe");
		});

		it("should use first_name and last_name as fallback", () => {
			const user = createMockUser({
				display_first_name: undefined,
				display_last_name: undefined,
				first_name: "Jane",
				last_name: "Smith",
			});

			expect(getUserDisplayName(user)).toBe("Jane Smith");
		});
	});

	describe("when given invalid display names", () => {
		it("should fallback to username when display names start with 'None'", () => {
			const user = createMockUserWithInvalidName();

			expect(getUserDisplayName(user)).toBe("testuser");
		});

		it("should fallback to username when display_first_name is 'None'", () => {
			const user = createMockUser({
				display_first_name: "None",
				display_last_name: "Doe",
				username: "johndoe",
			});

			expect(getUserDisplayName(user)).toBe("johndoe");
		});

		it("should fallback to username when names are missing", () => {
			const user = createMockUser({
				display_first_name: undefined,
				display_last_name: undefined,
				first_name: "",
				last_name: "",
				username: "testuser123",
			});

			expect(getUserDisplayName(user)).toBe("testuser123");
		});
	});

	describe("when given edge cases", () => {
		it("should return empty string for null user", () => {
			expect(getUserDisplayName(null)).toBe("");
		});

		it("should return empty string for undefined user", () => {
			expect(getUserDisplayName(undefined)).toBe("");
		});

		it("should return empty string when user has no name or username", () => {
			const user = createMockUser({
				display_first_name: undefined,
				display_last_name: undefined,
				first_name: "",
				last_name: "",
				username: "",
			});

			expect(getUserDisplayName(user)).toBe("");
		});
	});
});

describe("getUserInitials", () => {
	describe("when given valid names", () => {
		it("should return uppercase initials from display names", () => {
			const user = createMockUser({
				display_first_name: "John",
				display_last_name: "Doe",
			});

			expect(getUserInitials(user)).toBe("JD");
		});

		it("should return uppercase initials from first/last names", () => {
			const user = createMockUser({
				display_first_name: undefined,
				display_last_name: undefined,
				first_name: "Jane",
				last_name: "Smith",
			});

			expect(getUserInitials(user)).toBe("JS");
		});

		it("should handle lowercase names", () => {
			const user = createMockUser({
				display_first_name: "alice",
				display_last_name: "bob",
			});

			expect(getUserInitials(user)).toBe("AB");
		});
	});

	describe("when given edge cases", () => {
		it("should return empty string for null user", () => {
			expect(getUserInitials(null)).toBe("");
		});

		it("should return empty string for undefined user", () => {
			expect(getUserInitials(undefined)).toBe("");
		});

		it("should return empty string when names are missing", () => {
			const user = createMockUser({
				display_first_name: undefined,
				display_last_name: undefined,
				first_name: "",
				last_name: "",
			});

			expect(getUserInitials(user)).toBe("");
		});

		it("should handle single character names", () => {
			const user = createMockUser({
				display_first_name: "A",
				display_last_name: "B",
			});

			expect(getUserInitials(user)).toBe("AB");
		});
	});
});

describe("hasValidEmail", () => {
	describe("when given valid emails", () => {
		it("should return true for valid email", () => {
			const user = createMockUser({ email: "test@example.com" });

			expect(hasValidEmail(user)).toBe(true);
		});

		it("should return true for email with subdomain", () => {
			const user = createMockUser({ email: "user@mail.example.com" });

			expect(hasValidEmail(user)).toBe(true);
		});
	});

	describe("when given unset emails", () => {
		it("should return false for unset email", () => {
			const user = createMockUserWithoutEmail();

			expect(hasValidEmail(user)).toBe(false);
		});

		it("should return false for email starting with 'unset'", () => {
			const user = createMockUser({ email: "unset_user@example.com" });

			expect(hasValidEmail(user)).toBe(false);
		});
	});

	describe("when given edge cases", () => {
		it("should return false for null user", () => {
			expect(hasValidEmail(null)).toBe(false);
		});

		it("should return false for undefined user", () => {
			expect(hasValidEmail(undefined)).toBe(false);
		});

		it("should return false for user with no email", () => {
			const user = createMockUser({ email: "" });

			expect(hasValidEmail(user)).toBe(false);
		});
	});
});

describe("getUserEmail", () => {
	describe("when given valid emails", () => {
		it("should return email for valid user", () => {
			const user = createMockUser({ email: "john@example.com" });

			expect(getUserEmail(user)).toBe("john@example.com");
		});
	});

	describe("when given invalid emails", () => {
		it("should return 'No Email' for unset email", () => {
			const user = createMockUserWithoutEmail();

			expect(getUserEmail(user)).toBe("No Email");
		});

		it("should return 'No Email' for email starting with 'unset'", () => {
			const user = createMockUser({ email: "unset_user@example.com" });

			expect(getUserEmail(user)).toBe("No Email");
		});
	});

	describe("when given edge cases", () => {
		it("should return 'No Email' for null user", () => {
			expect(getUserEmail(null)).toBe("No Email");
		});

		it("should return 'No Email' for undefined user", () => {
			expect(getUserEmail(undefined)).toBe("No Email");
		});

		it("should return 'No Email' for user with empty email", () => {
			const user = createMockUser({ email: "" });

			expect(getUserEmail(user)).toBe("No Email");
		});
	});
});

describe("getUserPhone", () => {
	describe("when given valid phone", () => {
		it("should return phone number for valid user", () => {
			const user = createMockUser({ phone: "+61 8 1234 5678" });

			expect(getUserPhone(user)).toBe("+61 8 1234 5678");
		});

		it("should return phone number in different format", () => {
			const user = createMockUser({ phone: "1234567890" });

			expect(getUserPhone(user)).toBe("1234567890");
		});
	});

	describe("when given edge cases", () => {
		it("should return 'No Phone number' for null user", () => {
			expect(getUserPhone(null)).toBe("No Phone number");
		});

		it("should return 'No Phone number' for undefined user", () => {
			expect(getUserPhone(undefined)).toBe("No Phone number");
		});

		it("should return 'No Phone number' for user with no phone", () => {
			const user = createMockUser({ phone: undefined });

			expect(getUserPhone(user)).toBe("No Phone number");
		});

		it("should return 'No Phone number' for user with empty phone", () => {
			const user = createMockUser({ phone: "" });

			expect(getUserPhone(user)).toBe("No Phone number");
		});
	});
});

describe("toUserDisplayFormat", () => {
	describe("when given user with string image", () => {
		it("should preserve string image", () => {
			const input = {
				id: 1,
				display_first_name: "John",
				display_last_name: "Doe",
				email: "john@example.com",
				image: "https://example.com/avatar.jpg",
			};

			const result = toUserDisplayFormat(input);

			expect(result).toEqual({
				id: 1,
				display_first_name: "John",
				display_last_name: "Doe",
				email: "john@example.com",
				image: "https://example.com/avatar.jpg",
			});
		});
	});

	describe("when given user with object image", () => {
		it("should extract file from image object", () => {
			const input = {
				id: 1,
				display_first_name: "John",
				display_last_name: "Doe",
				email: "john@example.com",
				image: { file: "https://example.com/avatar.jpg" },
			};

			const result = toUserDisplayFormat(input);

			expect(result.image).toBe("https://example.com/avatar.jpg");
		});
	});

	describe("when given user with null image", () => {
		it("should handle null image", () => {
			const input = {
				id: 1,
				display_first_name: "John",
				display_last_name: "Doe",
				email: "john@example.com",
				image: null,
			};

			const result = toUserDisplayFormat(input);

			expect(result.image).toBeUndefined();
		});

		it("should handle undefined image", () => {
			const input = {
				id: 1,
				display_first_name: "John",
				display_last_name: "Doe",
				email: "john@example.com",
			};

			const result = toUserDisplayFormat(input);

			expect(result.image).toBeUndefined();
		});
	});

	describe("when given user with null display names", () => {
		it("should preserve null display names", () => {
			const input = {
				id: 1,
				display_first_name: null,
				display_last_name: null,
				email: "john@example.com",
				image: "https://example.com/avatar.jpg",
			};

			const result = toUserDisplayFormat(input);

			expect(result.display_first_name).toBeNull();
			expect(result.display_last_name).toBeNull();
		});
	});
});

describe("getCaretakerReasonLabel", () => {
	describe("when given known reasons", () => {
		it("should return 'On Leave' for 'leave'", () => {
			expect(getCaretakerReasonLabel("leave")).toBe("On Leave");
		});

		it("should return 'Leaving the Department' for 'resignation'", () => {
			expect(getCaretakerReasonLabel("resignation")).toBe(
				"Leaving the Department"
			);
		});

		it("should return 'Other' for 'other'", () => {
			expect(getCaretakerReasonLabel("other")).toBe("Other");
		});
	});

	describe("when given unknown reasons", () => {
		it("should return original value for unknown reason", () => {
			expect(getCaretakerReasonLabel("custom_reason")).toBe("custom_reason");
		});

		it("should return empty string for empty reason", () => {
			expect(getCaretakerReasonLabel("")).toBe("");
		});
	});
});
