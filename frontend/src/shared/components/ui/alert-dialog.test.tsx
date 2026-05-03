import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
} from "./alert-dialog";

describe("AlertDialogContent", () => {
	it("portals content to document.body when open", () => {
		const { container } = render(
			<div data-testid="parent-wrapper">
				<AlertDialog open={true} onOpenChange={() => {}}>
					<AlertDialogContent>
						<AlertDialogTitle>Test Title</AlertDialogTitle>
						<AlertDialogDescription>Test description</AlertDialogDescription>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		);

		// The alertdialog should be visible
		const dialog = screen.getByRole("alertdialog");
		expect(dialog).toBeInTheDocument();

		// The dialog should NOT be inside the parent wrapper — it should be
		// portalled to document.body, escaping any parent stacking context
		const parentWrapper = container.querySelector(
			"[data-testid='parent-wrapper']"
		);
		expect(parentWrapper).not.toBeNull();
		expect(parentWrapper!.contains(dialog)).toBe(false);

		// The dialog should be a direct descendant of document.body
		expect(document.body.contains(dialog)).toBe(true);
	});

	it("renders nothing when closed", () => {
		render(
			<AlertDialog open={false} onOpenChange={() => {}}>
				<AlertDialogContent>
					<AlertDialogTitle>Hidden Title</AlertDialogTitle>
				</AlertDialogContent>
			</AlertDialog>
		);

		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
	});

	it("renders overlay alongside the dialog content", () => {
		render(
			<AlertDialog open={true} onOpenChange={() => {}}>
				<AlertDialogContent>
					<AlertDialogTitle>Overlay Test</AlertDialogTitle>
				</AlertDialogContent>
			</AlertDialog>
		);

		// The overlay should be present in document.body
		const overlay = document.body.querySelector(".fixed.inset-0.z-\\[9998\\]");
		expect(overlay).not.toBeNull();
	});
});
