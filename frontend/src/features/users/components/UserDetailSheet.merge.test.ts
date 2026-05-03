/**
 * UserDetailSheet Merge Section Tests
 *
 * Verifies that the merge section is correctly wired up in UserDetailSheet:
 * - RequestMergeUserDialog is imported and rendered
 * - useRequestMergeUsers hook is imported and used
 * - usePendingMergeRequest hook is imported and used for persistent state
 * - useCancelAdminTask hook is imported for cancel functionality
 * - The merge button opens the dialog (no placeholder toast)
 * - handleConfirmMerge calls the mutation with correct parameters
 * - The dialog is rendered outside the Sheet component
 * - Cancel button is rendered when a pending merge task exists
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const filePath = join(__dirname, "UserDetailSheet.tsx");
const fileContent = readFileSync(filePath, "utf-8");

describe("UserDetailSheet Merge Dialog Wiring", () => {
	it("should import RequestMergeUserDialog", () => {
		expect(fileContent).toContain(
			'import { RequestMergeUserDialog } from "./RequestMergeUserDialog"'
		);
	});

	it("should import useRequestMergeUsers hook", () => {
		expect(fileContent).toContain(
			'import { useRequestMergeUsers } from "../hooks"'
		);
	});

	it("should declare showMergeDialog state", () => {
		expect(fileContent).toMatch(/useState.*showMergeDialog/s);
	});

	it("should initialise the useRequestMergeUsers mutation", () => {
		expect(fileContent).toContain("useRequestMergeUsers()");
	});

	it("should open the merge dialog on button click instead of showing a toast", () => {
		// The placeholder toast should be removed
		expect(fileContent).not.toContain(
			"Merge functionality will be implemented soon"
		);

		// The button should call setShowMergeDialog(true)
		expect(fileContent).toContain("setShowMergeDialog(true)");
	});

	it("should define handleConfirmMerge with correct mutation parameters", () => {
		// Verify the handler calls mutateAsync with primaryUserId and secondaryUserIds
		expect(fileContent).toContain("handleConfirmMerge");
		expect(fileContent).toContain("requestMergeMutation.mutateAsync");
		expect(fileContent).toContain("primaryUserId: authStore.user.id");
		expect(fileContent).toContain("secondaryUserIds: [user.id]");
	});

	it("should render RequestMergeUserDialog outside the Sheet component", () => {
		// The dialog should appear after </Sheet> (i.e. after the Sheet closing tag)
		const sheetCloseIndex = fileContent.lastIndexOf("</Sheet>");
		const dialogIndex = fileContent.indexOf("<RequestMergeUserDialog");

		expect(sheetCloseIndex).toBeGreaterThan(-1);
		expect(dialogIndex).toBeGreaterThan(-1);
		expect(dialogIndex).toBeGreaterThan(sheetCloseIndex);
	});

	it("should pass showMergeDialog and setShowMergeDialog to the dialog", () => {
		expect(fileContent).toContain("open={showMergeDialog}");
		expect(fileContent).toContain("onOpenChange={setShowMergeDialog}");
		expect(fileContent).toContain("onConfirm={handleConfirmMerge}");
	});

	it("should disable the merge button when viewing own profile", () => {
		// Find the merge button section and verify it has the disabled prop
		const mergeButtonMatch = fileContent.match(
			/Merge with My Account[\s\S]*?<\/Button>/
		);
		expect(mergeButtonMatch).not.toBeNull();

		// The button should have disabled={isViewingOwnProfile || ...}
		const mergeSection = fileContent.match(
			/setShowMergeDialog[\s\S]*?Merge with My Account/
		);
		expect(mergeSection).not.toBeNull();
		expect(mergeSection![0]).toContain("isViewingOwnProfile");
	});
});

describe("UserDetailSheet Persistent Merge State", () => {
	it("should import usePendingMergeRequest hook", () => {
		expect(fileContent).toContain("usePendingMergeRequest");
	});

	it("should call usePendingMergeRequest with the user ID", () => {
		// The hook should be called somewhere in the component
		expect(fileContent).toMatch(/usePendingMergeRequest\(/);
	});

	it("should check pendingMergeTask for conditional rendering", () => {
		expect(fileContent).toContain("pendingMergeTask");
	});

	it("should show 'Merge Requested' disabled button when pending", () => {
		expect(fileContent).toContain("Merge Requested");
	});

	it("should render a Cancel Request button", () => {
		expect(fileContent).toContain("Cancel Request");
	});

	it("should import useCancelAdminTask hook", () => {
		expect(fileContent).toContain("useCancelAdminTask");
	});

	it("should call cancelMergeMutation with the pending task ID", () => {
		expect(fileContent).toContain(
			"cancelMergeMutation.mutate(pendingMergeTask.id)"
		);
	});

	it("should show cancelling state on the cancel button", () => {
		expect(fileContent).toContain("cancelMergeMutation.isPending");
		expect(fileContent).toContain("Cancelling...");
	});
});
