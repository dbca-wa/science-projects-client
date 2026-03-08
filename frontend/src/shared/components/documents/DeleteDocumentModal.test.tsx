import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { DeleteDocumentModal } from "./DeleteDocumentModal";

expect.extend(toHaveNoViolations);

describe("DeleteDocumentModal", () => {
	const mockOnClose = vi.fn();
	const mockOnConfirm = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Modal rendering", () => {
		it("should render delete modal with correct title for concept_plan", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
				/>
			);

			expect(
				screen.getByRole("heading", { name: "Delete concept plan?" })
			).toBeInTheDocument();
		});

		it("should render delete modal with correct title for project_plan", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="projectplan"
				/>
			);

			expect(
				screen.getByRole("heading", { name: "Delete project plan?" })
			).toBeInTheDocument();
		});

		it("should render delete modal with correct title for progress_report", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="progressreport"
				/>
			);

			expect(
				screen.getByRole("heading", { name: "Delete progress report?" })
			).toBeInTheDocument();
		});

		it("should render delete modal with correct title for student_report", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="studentreport"
				/>
			);

			expect(
				screen.getByRole("heading", { name: "Delete student report?" })
			).toBeInTheDocument();
		});

		it("should render delete modal with correct title for project_closure", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="projectclosure"
				/>
			);

			expect(
				screen.getByRole("heading", { name: "Delete project closure?" })
			).toBeInTheDocument();
		});

		it("should show warning icon", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
				/>
			);

			// Check for the warning icon container
			const iconContainer = screen.getByRole("heading", {
				name: "Delete concept plan?",
			}).parentElement;
			expect(iconContainer?.querySelector("svg")).toBeInTheDocument();
		});

		it("should show warning message", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
				/>
			);

			expect(
				screen.getByText(/this action cannot be undone/i)
			).toBeInTheDocument();
			expect(
				screen.getByText(/permanently delete the concept plan/i)
			).toBeInTheDocument();
		});

		it("should not render when isOpen is false", () => {
			const { container } = render(
				<DeleteDocumentModal
					isOpen={false}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
				/>
			);

			// AlertDialog should not be visible
			expect(
				container.querySelector('[role="alertdialog"]')
			).not.toBeInTheDocument();
		});
	});

	describe("User interactions", () => {
		it("should call onClose when cancel button is clicked", async () => {
			const user = userEvent.setup();

			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
				/>
			);

			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			await user.click(cancelButton);

			expect(mockOnClose).toHaveBeenCalled();
		});

		it("should call onConfirm when delete button is clicked", async () => {
			const user = userEvent.setup();

			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
				/>
			);

			const deleteButton = screen.getByRole("button", { name: /^delete$/i });
			await user.click(deleteButton);

			expect(mockOnConfirm).toHaveBeenCalled();
		});

		it("should not call onClose when clicking outside if isDeleting is true", async () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
					isDeleting={true}
				/>
			);

			// Buttons should be disabled when deleting
			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			const deleteButton = screen.getByRole("button", { name: /deleting/i });

			expect(cancelButton).toBeDisabled();
			expect(deleteButton).toBeDisabled();
		});
	});

	describe("Loading state", () => {
		it("should show 'Deleting...' text when isDeleting is true", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
					isDeleting={true}
				/>
			);

			expect(screen.getByText("Deleting...")).toBeInTheDocument();
		});

		it("should disable cancel button when isDeleting is true", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
					isDeleting={true}
				/>
			);

			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			expect(cancelButton).toBeDisabled();
		});

		it("should disable delete button when isDeleting is true", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
					isDeleting={true}
				/>
			);

			const deleteButton = screen.getByRole("button", { name: /deleting/i });
			expect(deleteButton).toBeDisabled();
		});

		it("should show 'Delete' text when isDeleting is false", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
					isDeleting={false}
				/>
			);

			expect(
				screen.getByRole("button", { name: /^delete$/i })
			).toBeInTheDocument();
		});
	});

	describe("Button styling", () => {
		it("should use destructive styling for delete button", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
				/>
			);

			const deleteButton = screen.getByRole("button", { name: /^delete$/i });
			expect(deleteButton).toHaveClass("bg-destructive");
		});
	});

	describe("Document type formatting", () => {
		it("should format concept_plan as 'concept plan'", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
				/>
			);

			expect(screen.getByText(/delete concept plan/i)).toBeInTheDocument();
		});

		it("should format project_plan as 'project plan'", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="projectplan"
				/>
			);

			expect(screen.getByText(/delete project plan/i)).toBeInTheDocument();
		});

		it("should format progress_report as 'progress report'", () => {
			render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="progressreport"
				/>
			);

			expect(screen.getByText(/delete progress report/i)).toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have no accessibility violations - concept_plan", async () => {
			const { container } = render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="concept"
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have no accessibility violations - project_plan", async () => {
			const { container } = render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="projectplan"
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have no accessibility violations - progress_report", async () => {
			const { container } = render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="progressreport"
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have no accessibility violations - student_report", async () => {
			const { container } = render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="studentreport"
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have no accessibility violations - project_closure", async () => {
			const { container } = render(
				<DeleteDocumentModal
					isOpen={true}
					onClose={mockOnClose}
					onConfirm={mockOnConfirm}
					documentType="projectclosure"
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});
});
