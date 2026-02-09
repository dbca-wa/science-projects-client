/**
 * DataTable Utilities Tests
 */

import { describe, it, expect } from "vitest";
import {
	sortData,
	toggleSort,
	paginateData,
	calculateTotalPages,
	getPaginationInfo,
} from "./utils";
import type { ColumnDef, SortConfig } from "./types";

// Test data type
interface TestItem {
	id: number;
	name: string;
	value: number;
}

// Test data
const testData: TestItem[] = [
	{ id: 1, name: "Charlie", value: 300 },
	{ id: 2, name: "Alpha", value: 100 },
	{ id: 3, name: "Beta", value: 200 },
];

// Test columns
const testColumns: ColumnDef<TestItem>[] = [
	{
		id: "name",
		header: "Name",
		accessor: (row) => row.name,
		sortable: true,
	},
	{
		id: "value",
		header: "Value",
		accessor: (row) => row.value,
		sortable: true,
	},
	{
		id: "id",
		header: "ID",
		accessor: (row) => row.id,
		sortable: false,
	},
];

describe("sortData", () => {
	it("returns original data when no sort config", () => {
		const result = sortData(testData, testColumns, undefined);
		expect(result).toEqual(testData);
	});

	it("sorts by string column ascending", () => {
		const sortConfig: SortConfig = { column: "name", direction: "asc" };
		const result = sortData(testData, testColumns, sortConfig);

		expect(result[0].name).toBe("Alpha");
		expect(result[1].name).toBe("Beta");
		expect(result[2].name).toBe("Charlie");
	});

	it("sorts by string column descending", () => {
		const sortConfig: SortConfig = { column: "name", direction: "desc" };
		const result = sortData(testData, testColumns, sortConfig);

		expect(result[0].name).toBe("Charlie");
		expect(result[1].name).toBe("Beta");
		expect(result[2].name).toBe("Alpha");
	});

	it("sorts by number column ascending", () => {
		const sortConfig: SortConfig = { column: "value", direction: "asc" };
		const result = sortData(testData, testColumns, sortConfig);

		expect(result[0].value).toBe(100);
		expect(result[1].value).toBe(200);
		expect(result[2].value).toBe(300);
	});

	it("sorts by number column descending", () => {
		const sortConfig: SortConfig = { column: "value", direction: "desc" };
		const result = sortData(testData, testColumns, sortConfig);

		expect(result[0].value).toBe(300);
		expect(result[1].value).toBe(200);
		expect(result[2].value).toBe(100);
	});

	it("returns original data for non-sortable column", () => {
		const sortConfig: SortConfig = { column: "id", direction: "asc" };
		const result = sortData(testData, testColumns, sortConfig);

		// Should return original order since id column is not sortable
		expect(result).toEqual(testData);
	});

	it("returns original data for unknown column", () => {
		const sortConfig: SortConfig = { column: "unknown", direction: "asc" };
		const result = sortData(testData, testColumns, sortConfig);

		expect(result).toEqual(testData);
	});

	it("uses custom sort function when provided", () => {
		const columnsWithCustomSort: ColumnDef<TestItem>[] = [
			{
				id: "name",
				header: "Name",
				accessor: (row) => row.name,
				sortable: true,
				sortFn: (a, b) => b.name.localeCompare(a.name), // Reverse alphabetical
			},
		];

		const sortConfig: SortConfig = { column: "name", direction: "asc" };
		const result = sortData(testData, columnsWithCustomSort, sortConfig);

		// Custom sort is reverse alphabetical
		expect(result[0].name).toBe("Charlie");
		expect(result[1].name).toBe("Beta");
		expect(result[2].name).toBe("Alpha");
	});

	it("does not mutate original array", () => {
		const original = [...testData];
		const sortConfig: SortConfig = { column: "name", direction: "asc" };
		sortData(testData, testColumns, sortConfig);

		expect(testData).toEqual(original);
	});
});

describe("toggleSort", () => {
	it("sets ascending sort for new column", () => {
		const result = toggleSort(undefined, "name");

		expect(result).toEqual({ column: "name", direction: "asc" });
	});

	it("toggles to descending when clicking same column", () => {
		const current: SortConfig = { column: "name", direction: "asc" };
		const result = toggleSort(current, "name");

		expect(result).toEqual({ column: "name", direction: "desc" });
	});

	it("toggles to ascending when clicking same column again", () => {
		const current: SortConfig = { column: "name", direction: "desc" };
		const result = toggleSort(current, "name");

		expect(result).toEqual({ column: "name", direction: "asc" });
	});

	it("resets to ascending when clicking different column", () => {
		const current: SortConfig = { column: "name", direction: "desc" };
		const result = toggleSort(current, "value");

		expect(result).toEqual({ column: "value", direction: "asc" });
	});
});

describe("paginateData", () => {
	const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	it("returns first page correctly", () => {
		const result = paginateData(items, 1, 3);
		expect(result).toEqual([1, 2, 3]);
	});

	it("returns middle page correctly", () => {
		const result = paginateData(items, 2, 3);
		expect(result).toEqual([4, 5, 6]);
	});

	it("returns last page correctly", () => {
		const result = paginateData(items, 4, 3);
		expect(result).toEqual([10]);
	});

	it("returns empty array for page beyond data", () => {
		const result = paginateData(items, 10, 3);
		expect(result).toEqual([]);
	});

	it("returns all data when page size exceeds data length", () => {
		const result = paginateData(items, 1, 100);
		expect(result).toEqual(items);
	});
});

describe("calculateTotalPages", () => {
	it("calculates pages correctly for exact division", () => {
		expect(calculateTotalPages(10, 5)).toBe(2);
	});

	it("rounds up for partial pages", () => {
		expect(calculateTotalPages(11, 5)).toBe(3);
	});

	it("returns 1 for empty data", () => {
		expect(calculateTotalPages(0, 5)).toBe(0);
	});

	it("returns 1 when data fits in one page", () => {
		expect(calculateTotalPages(3, 10)).toBe(1);
	});
});

describe("getPaginationInfo", () => {
	it("returns correct info for first page", () => {
		const result = getPaginationInfo(100, 1, 10);

		expect(result).toEqual({
			startIndex: 1,
			endIndex: 10,
			totalPages: 10,
			totalItems: 100,
		});
	});

	it("returns correct info for middle page", () => {
		const result = getPaginationInfo(100, 5, 10);

		expect(result).toEqual({
			startIndex: 41,
			endIndex: 50,
			totalPages: 10,
			totalItems: 100,
		});
	});

	it("returns correct info for last page with partial data", () => {
		const result = getPaginationInfo(95, 10, 10);

		expect(result).toEqual({
			startIndex: 91,
			endIndex: 95,
			totalPages: 10,
			totalItems: 95,
		});
	});
});
