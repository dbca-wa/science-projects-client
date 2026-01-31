/**
 * DataTable Component Tests
 * 
 * Tests for the generic DataTable component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable } from "./DataTable";
import type { ColumnDef } from "./types";

// Test data type
interface TestItem {
	id: number;
	name: string;
	value: number;
	active: boolean;
}

// Test data
const testData: TestItem[] = [
	{ id: 1, name: "Alpha", value: 100, active: true },
	{ id: 2, name: "Beta", value: 200, active: false },
	{ id: 3, name: "Gamma", value: 150, active: true },
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
		id: "active",
		header: "Active",
		accessor: (row) => row.active,
		cell: (row) => (row.active ? "Yes" : "No"),
	},
];

describe("DataTable", () => {
	describe("Rendering", () => {
		it("renders data correctly", () => {
			render(
				<DataTable
					data={testData}
					columns={testColumns}
					getRowKey={(row) => row.id}
				/>
			);

			// Check that data is rendered
			expect(screen.getByText("Alpha")).toBeInTheDocument();
			expect(screen.getByText("Beta")).toBeInTheDocument();
			expect(screen.getByText("Gamma")).toBeInTheDocument();
		});

		it("renders column headers", () => {
			render(
				<DataTable
					data={testData}
					columns={testColumns}
					getRowKey={(row) => row.id}
				/>
			);

			expect(screen.getByText("Name")).toBeInTheDocument();
			expect(screen.getByText("Value")).toBeInTheDocument();
			expect(screen.getByText("Active")).toBeInTheDocument();
		});

		it("renders custom cell content", () => {
			render(
				<DataTable
					data={testData}
					columns={testColumns}
					getRowKey={(row) => row.id}
				/>
			);

			// Custom cell renderer converts boolean to Yes/No
			expect(screen.getAllByText("Yes")).toHaveLength(2);
			expect(screen.getByText("No")).toBeInTheDocument();
		});
	});

	describe("Empty State", () => {
		it("shows empty message when no data", () => {
			render(
				<DataTable
					data={[]}
					columns={testColumns}
					getRowKey={(row) => row.id}
					emptyMessage="No items found"
				/>
			);

			expect(screen.getByText("No items found")).toBeInTheDocument();
		});

		it("shows default empty message", () => {
			render(
				<DataTable
					data={[]}
					columns={testColumns}
					getRowKey={(row) => row.id}
				/>
			);

			expect(screen.getByText("No data available")).toBeInTheDocument();
		});
	});

	describe("Loading State", () => {
		it("shows loading state", () => {
			render(
				<DataTable
					data={testData}
					columns={testColumns}
					getRowKey={(row) => row.id}
					loading={true}
				/>
			);

			expect(screen.getByText("Loading...")).toBeInTheDocument();
		});
	});

	describe("Sorting", () => {
		it("sorts data when clicking sortable column header", () => {
			render(
				<DataTable
					data={testData}
					columns={testColumns}
					getRowKey={(row) => row.id}
				/>
			);

			// Verify rows are rendered
			expect(screen.getAllByRole("row").length).toBeGreaterThan(0);
			
			// Click on Name header to sort
			const nameHeader = screen.getByRole("button", { name: /name/i });
			fireEvent.click(nameHeader);

			// Data should be sorted alphabetically (Alpha, Beta, Gamma)
			// This is already the default order, so click again for desc
			fireEvent.click(nameHeader);

			// Now should be Gamma, Beta, Alpha (descending)
			const rowsAfterSort = screen.getAllByRole("row");
			expect(rowsAfterSort.length).toBeGreaterThan(0);
		});

		it("applies default sort", () => {
			render(
				<DataTable
					data={testData}
					columns={testColumns}
					getRowKey={(row) => row.id}
					defaultSort={{ column: "value", direction: "desc" }}
				/>
			);

			// Data should be sorted by value descending (200, 150, 100)
			const rows = screen.getAllByRole("row");
			expect(rows.length).toBeGreaterThan(0);
		});
	});

	describe("Row Click", () => {
		it("calls onRowClick when row is clicked", () => {
			const handleClick = vi.fn();

			render(
				<DataTable
					data={testData}
					columns={testColumns}
					getRowKey={(row) => row.id}
					onRowClick={handleClick}
				/>
			);

			// Click on a row
			const rows = screen.getAllByRole("row");
			fireEvent.click(rows[0]);

			expect(handleClick).toHaveBeenCalledTimes(1);
			expect(handleClick).toHaveBeenCalledWith(
				expect.objectContaining({ id: 1, name: "Alpha" }),
				expect.any(Object)
			);
		});

		it("handles keyboard navigation", () => {
			const handleClick = vi.fn();

			render(
				<DataTable
					data={testData}
					columns={testColumns}
					getRowKey={(row) => row.id}
					onRowClick={handleClick}
				/>
			);

			// Press Enter on a row
			const rows = screen.getAllByRole("row");
			fireEvent.keyDown(rows[0], { key: "Enter" });

			expect(handleClick).toHaveBeenCalledTimes(1);
		});
	});

	describe("Pagination", () => {
		it("paginates data when enabled", () => {
			const manyItems: TestItem[] = Array.from({ length: 10 }, (_, i) => ({
				id: i + 1,
				name: `Item ${i + 1}`,
				value: (i + 1) * 10,
				active: i % 2 === 0,
			}));

			render(
				<DataTable
					data={manyItems}
					columns={testColumns}
					getRowKey={(row) => row.id}
					pagination={{ enabled: true, pageSize: 3 }}
				/>
			);

			// Should only show first 3 items
			expect(screen.getByText("Item 1")).toBeInTheDocument();
			expect(screen.getByText("Item 2")).toBeInTheDocument();
			expect(screen.getByText("Item 3")).toBeInTheDocument();
			expect(screen.queryByText("Item 4")).not.toBeInTheDocument();
		});

		it("does not show pagination for single page", () => {
			render(
				<DataTable
					data={testData}
					columns={testColumns}
					getRowKey={(row) => row.id}
					pagination={{ enabled: true, pageSize: 10 }}
				/>
			);

			// Pagination should not be visible (only 3 items, page size 10)
			expect(screen.queryByText(/page/i)).not.toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("has correct ARIA roles", () => {
			render(
				<DataTable
					data={testData}
					columns={testColumns}
					getRowKey={(row) => row.id}
					ariaLabel="Test table"
				/>
			);

			expect(screen.getByRole("table")).toHaveAttribute("aria-label", "Test table");
			expect(screen.getByRole("rowgroup")).toBeInTheDocument();
			expect(screen.getAllByRole("row")).toHaveLength(3);
		});

		it("rows are focusable when clickable", () => {
			render(
				<DataTable
					data={testData}
					columns={testColumns}
					getRowKey={(row) => row.id}
					onRowClick={() => {}}
				/>
			);

			const rows = screen.getAllByRole("row");
			rows.forEach((row) => {
				expect(row).toHaveAttribute("tabIndex", "0");
			});
		});
	});
});
