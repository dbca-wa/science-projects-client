import type {
	IBranch,
	IBusinessArea,
	IAffiliation,
	IAgency,
} from "@/shared/types/org.types";

/**
 * Create a mock branch for testing
 * Provides sensible defaults with ability to override any field
 *
 * @example
 * // Create branch with defaults
 * const branch = createMockBranch();
 *
 * // Override specific fields
 * const customBranch = createMockBranch({ name: "Custom Branch" });
 */
export const createMockBranch = (overrides?: Partial<IBranch>): IBranch => ({
	id: 1,
	name: "Test Branch",
	agency: 1,
	manager: 1,
	...overrides,
});

/**
 * Create a mock business area for testing
 * Provides sensible defaults with ability to override any field
 *
 * @example
 * // Create business area with defaults
 * const ba = createMockBusinessArea();
 *
 * // Override specific fields
 * const customBA = createMockBusinessArea({
 *   name: "Custom BA",
 *   leader: 5
 * });
 */
export const createMockBusinessArea = (
	overrides?: Partial<IBusinessArea>
): IBusinessArea => ({
	id: 1,
	name: "Test Business Area",
	focus: "Testing and Quality Assurance",
	introduction: "A business area dedicated to testing",
	is_active: true,
	image: {
		id: 1,
		old_file: "",
		file: "https://example.com/ba-image.jpg",
	},
	leader: 1,
	...overrides,
});

/**
 * Create a mock affiliation for testing
 * Provides sensible defaults with ability to override any field
 *
 * @example
 * const affiliation = createMockAffiliation();
 * const user = createMockUser({ affiliation });
 */
export const createMockAffiliation = (
	overrides?: Partial<IAffiliation>
): IAffiliation => ({
	id: 1,
	name: "Test Affiliation",
	...overrides,
});

/**
 * Create a mock agency for testing
 * Provides sensible defaults with ability to override any field
 *
 * @example
 * const agency = createMockAgency();
 */
export const createMockAgency = (overrides?: Partial<IAgency>): IAgency => ({
	id: 1,
	name: "Test Agency",
	key_stakeholder: 1,
	is_active: true,
	...overrides,
});
