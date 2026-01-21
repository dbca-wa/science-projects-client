import type { IUserData, ICaretakerSimpleUserData } from "@/shared/types/user.types";

/**
 * Create a mock image data object
 * Used internally by user factories
 */
const createMockImage = () => ({
	id: 1,
	file: "https://example.com/avatar.jpg",
	old_file: "",
	user: 1,
});

/**
 * Create a mock user for testing
 * Provides sensible defaults with ability to override any field
 * 
 * @example
 * // Create user with defaults
 * const user = createMockUser();
 * 
 * // Override specific fields
 * const admin = createMockUser({ is_superuser: true });
 * const userWithEmail = createMockUser({ email: "test@example.com" });
 */
export const createMockUser = (overrides?: Partial<IUserData>): IUserData => ({
	id: 1,
	username: "testuser",
	email: "test@example.com",
	display_first_name: "Test",
	display_last_name: "User",
	first_name: "Test",
	last_name: "User",
	is_superuser: false,
	is_staff: false,
	is_active: true,
	image: createMockImage(),
	business_area: undefined,
	role: "member",
	branch: {
		id: 1,
		name: "Test Branch",
		agency: 1,
		manager: 1,
	},
	affiliation: {
		id: 1,
		name: "Test Affiliation",
	},
	phone: "+61 8 1234 5678",
	title: "Test Developer",
	about: "Test user for unit testing",
	expertise: "Testing, Quality Assurance",
	...overrides,
});

/**
 * Create a mock user with no email (unset email pattern)
 * Used to test email validation logic
 * 
 * @example
 * const user = createMockUserWithoutEmail();
 * expect(hasValidEmail(user)).toBe(false);
 */
export const createMockUserWithoutEmail = (): IUserData =>
	createMockUser({
		email: "unset_email_testuser@example.com",
	});

/**
 * Create a mock user with invalid display name
 * Used to test name fallback logic
 * 
 * @example
 * const user = createMockUserWithInvalidName();
 * expect(getUserDisplayName(user)).toBe("testuser");
 */
export const createMockUserWithInvalidName = (): IUserData =>
	createMockUser({
		display_first_name: "None",
		display_last_name: "None",
		username: "testuser",
	});

/**
 * Create a mock admin user
 * Convenience factory for admin-specific tests
 * 
 * @example
 * const admin = createMockAdminUser();
 * expect(admin.is_superuser).toBe(true);
 */
export const createMockAdminUser = (): IUserData =>
	createMockUser({
		is_superuser: true,
		is_staff: true,
		role: "admin",
		title: "System Administrator",
	});

/**
 * Create a mock caretaker user (simplified)
 * Used for testing caretaker relationships
 * 
 * @example
 * const caretaker = createMockCaretaker();
 * const user = createMockUser({ caretakers: [caretaker] });
 */
export const createMockCaretaker = (
	overrides?: Partial<ICaretakerSimpleUserData>
): ICaretakerSimpleUserData => ({
	id: 2,
	is_superuser: false,
	display_first_name: "Caretaker",
	display_last_name: "User",
	email: "caretaker@example.com",
	image: "https://example.com/caretaker-avatar.jpg",
	end_date: null,
	caretakers: [],
	caretaking_for: [],
	...overrides,
});
