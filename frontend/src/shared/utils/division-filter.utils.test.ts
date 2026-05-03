import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
	divisionHasApprovers,
	filterBusinessAreasByApprovers,
} from "./division-filter.utils";
import type { IBusinessArea, IDivision } from "@/shared/types/org.types";

/** Helper to create a mock division */
const mockDivision = (
	id: number,
	hasKs: boolean,
	approverCount: number
): IDivision => ({
	id,
	name: `Division ${id}`,
	slug: `division-${id}`,
	director: 1,
	approver: 1,
	key_stakeholder: hasKs
		? { id: 100, name: "KS User", email: "ks@test.com" }
		: null,
	approvers: Array.from({ length: approverCount }, (_, i) => ({
		id: 200 + i,
		name: `Approver ${i}`,
		email: `approver${i}@test.com`,
	})),
});

/** Helper to create a mock business area */
const mockBA = (id: number, divisionId: number | undefined): IBusinessArea => ({
	id,
	name: `BA ${id}`,
	is_active: true,
	focus: "",
	introduction: "",
	image: null,
	division: divisionId,
});

describe("divisionHasApprovers", () => {
	it("returns true when division has a key stakeholder", () => {
		const division = mockDivision(1, true, 0);
		expect(divisionHasApprovers(division)).toBe(true);
	});

	it("returns true when division has approvers", () => {
		const division = mockDivision(1, false, 2);
		expect(divisionHasApprovers(division)).toBe(true);
	});

	it("returns true when division has both", () => {
		const division = mockDivision(1, true, 2);
		expect(divisionHasApprovers(division)).toBe(true);
	});

	it("returns false when division has neither", () => {
		const division = mockDivision(1, false, 0);
		expect(divisionHasApprovers(division)).toBe(false);
	});
});

describe("filterBusinessAreasByApprovers", () => {
	it("excludes BAs whose division has no approvers or key stakeholder", () => {
		const divWithApprovers = mockDivision(1, true, 0);
		const divWithout = mockDivision(2, false, 0);
		const ba1 = mockBA(1, 1);
		const ba2 = mockBA(2, 2);

		const result = filterBusinessAreasByApprovers(
			[ba1, ba2],
			[divWithApprovers, divWithout]
		);

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe(1);
	});

	it("returns all BAs when no division data is provided", () => {
		const ba1 = mockBA(1, 1);
		const ba2 = mockBA(2, 2);

		const result = filterBusinessAreasByApprovers([ba1, ba2], undefined);

		expect(result).toHaveLength(2);
	});

	it("returns all BAs when divisions array is empty", () => {
		const ba1 = mockBA(1, 1);
		const ba2 = mockBA(2, 2);

		const result = filterBusinessAreasByApprovers([ba1, ba2], []);

		expect(result).toHaveLength(2);
	});

	it("excludes BAs with no division", () => {
		const division = mockDivision(1, true, 0);
		const baWithDiv = mockBA(1, 1);
		const baWithoutDiv = mockBA(2, undefined);

		const result = filterBusinessAreasByApprovers(
			[baWithDiv, baWithoutDiv],
			[division]
		);

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe(1);
	});

	it("excludes BAs whose division is not in the provided list", () => {
		const division = mockDivision(1, true, 0);
		const baKnownDiv = mockBA(1, 1);
		const baUnknownDiv = mockBA(2, 999);

		const result = filterBusinessAreasByApprovers(
			[baKnownDiv, baUnknownDiv],
			[division]
		);

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe(1);
	});
});

// Property 5: Division Filtering for Business Area Selector
describe("Property 5: Division filtering correctness", () => {
	// Arbitrary for IEmailListUser
	const emailListUserArb = fc.record({
		id: fc.integer({ min: 1, max: 10000 }),
		name: fc.string({ minLength: 1, maxLength: 20 }),
		email: fc.emailAddress(),
	});

	// Arbitrary for IDivision
	const divisionArb = fc.record({
		id: fc.integer({ min: 1, max: 100 }),
		name: fc.string({ minLength: 1, maxLength: 30 }),
		slug: fc.string({ minLength: 1, maxLength: 30 }),
		director: fc.integer({ min: 1, max: 10000 }),
		approver: fc.integer({ min: 1, max: 10000 }),
		key_stakeholder: fc.option(emailListUserArb, { nil: null }),
		approvers: fc.array(emailListUserArb, { minLength: 0, maxLength: 5 }),
	});

	// Arbitrary for IBusinessArea with a division ID
	const businessAreaArb = (divisionIds: number[]) =>
		fc.record({
			id: fc.integer({ min: 1, max: 1000 }),
			name: fc.string({ minLength: 1, maxLength: 30 }),
			is_active: fc.constant(true as const),
			focus: fc.constant(""),
			introduction: fc.constant(""),
			image: fc.constant(null),
			division: fc.oneof(
				fc.constantFrom(...divisionIds),
				fc.constant(undefined as number | undefined)
			),
		});

	it("includes a BA iff its division has at least one approver or key stakeholder", () => {
		fc.assert(
			fc.property(
				fc
					.array(divisionArb, { minLength: 1, maxLength: 10 })
					.chain((divisions) => {
						const divIds = divisions.map((d) => d.id);
						return fc.tuple(
							fc.constant(divisions as IDivision[]),
							fc.array(businessAreaArb(divIds) as fc.Arbitrary<IBusinessArea>, {
								minLength: 1,
								maxLength: 20,
							})
						);
					}),
				([divisions, businessAreas]) => {
					const divMap = new Map(divisions.map((d) => [d.id, d]));
					const filtered = filterBusinessAreasByApprovers(
						businessAreas,
						divisions
					);

					for (const ba of filtered) {
						const divId =
							typeof ba.division === "object" ? ba.division?.id : ba.division;
						expect(divId).toBeDefined();
						const div = divMap.get(divId!);
						expect(div).toBeDefined();
						expect(divisionHasApprovers(div!)).toBe(true);
					}

					// Verify excluded BAs have divisions without approvers
					const filteredIds = new Set(filtered.map((ba) => ba.id));
					for (const ba of businessAreas) {
						if (!filteredIds.has(ba.id!)) {
							const divId =
								typeof ba.division === "object" ? ba.division?.id : ba.division;
							if (divId !== undefined) {
								const div = divMap.get(divId);
								if (div) {
									expect(divisionHasApprovers(div)).toBe(false);
								}
							}
						}
					}
				}
			),
			{ numRuns: 100 }
		);
	});
});
