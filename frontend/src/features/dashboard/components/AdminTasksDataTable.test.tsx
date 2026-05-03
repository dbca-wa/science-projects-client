/**
 * AdminTasksDataTable Tests
 *
 * Verifies the data table renders approve/reject buttons,
 * shows merge task details with both users, and includes
 * a confirmation AlertDialog before approval.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const filePath = join(__dirname, "AdminTasksDataTable.tsx");
const fileContent = readFileSync(filePath, "utf-8");

describe("AdminTasksDataTable", () => {
	describe("Approve and Reject buttons", () => {
		it("should render an Approve button", () => {
			expect(fileContent).toContain("Approve");
			expect(fileContent).toContain("CheckCircle");
		});

		it("should render a Reject button", () => {
			expect(fileContent).toContain("Reject");
			expect(fileContent).toContain("XCircle");
		});

		it("should use useApproveAdminTask hook", () => {
			expect(fileContent).toContain("useApproveAdminTask");
			expect(fileContent).toContain("approveMutation");
		});

		it("should use useRejectAdminTask hook", () => {
			expect(fileContent).toContain("useRejectAdminTask");
			expect(fileContent).toContain("rejectMutation");
		});

		it("should disable buttons when a mutation is pending", () => {
			expect(fileContent).toContain("disabled={isBusy}");
		});
	});

	describe("Merge task details", () => {
		it("should show secondary user name for merge tasks", () => {
			expect(fileContent).toContain("secondary.display_first_name");
			expect(fileContent).toContain("secondary.display_last_name");
		});

		it("should show primary user name for merge tasks", () => {
			expect(fileContent).toContain("primary.display_first_name");
			expect(fileContent).toContain("primary.display_last_name");
		});

		it("should display secondary user email", () => {
			expect(fileContent).toContain("secondary.email");
		});

		it("should display primary user email", () => {
			expect(fileContent).toContain("primary.email");
		});

		it("should show 'Merge ... into ...' format", () => {
			expect(fileContent).toContain("Merge{");
			expect(fileContent).toContain("into{");
		});
	});

	describe("Confirmation AlertDialog", () => {
		it("should import AlertDialog components", () => {
			expect(fileContent).toContain(
				'from "@/shared/components/ui/alert-dialog"'
			);
		});

		it("should have confirmation dialog state", () => {
			expect(fileContent).toContain("confirmDialogOpen");
			expect(fileContent).toContain("setConfirmDialogOpen");
			expect(fileContent).toContain("taskToApprove");
		});

		it("should show the dialog on approve click instead of directly mutating", () => {
			expect(fileContent).toContain("handleApproveClick(row)");
		});

		it("should display merge consequences in the dialog", () => {
			expect(fileContent).toContain(
				"All projects, comments, and documents will be transferred"
			);
			expect(fileContent).toContain(
				"The secondary user will be permanently deleted"
			);
			expect(fileContent).toContain("This action cannot be undone");
		});

		it("should have Confirm Approve and Cancel buttons in the dialog", () => {
			expect(fileContent).toContain("Confirm Approve");
			expect(fileContent).toContain(
				"<AlertDialogCancel>Cancel</AlertDialogCancel>"
			);
		});

		it("should call approveMutation.mutate on confirm", () => {
			expect(fileContent).toContain("handleConfirmApprove");
			expect(fileContent).toContain("approveMutation.mutate(taskToApprove.id)");
		});
	});
});
