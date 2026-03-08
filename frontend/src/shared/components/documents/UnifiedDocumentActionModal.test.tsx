import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { UnifiedDocumentActionModal } from "./UnifiedDocumentActionModal";
import type { IMainDoc } from "@/shared/types/document.types";
import type { IProjectData } from "@/shared/types/project.types";

expect.extend(toHaveNoViolations);

// Helper to create mock project
function createMockProject(
	overrides: Partial<IProjectData> = {}
): IProjectData {
	return {
		id: 1,
		areas: [],
		kind: "science",
		title: "Test Project",
		status: "active",
		description: "",
		tagline: "",
		image: null,
		keywords: "",
		year: 2024,
		number: 6,
		start_date: new Date("2024-01-01"),
		end_date: new Date("2024-12-31"),
		business_area: {
			id: 1,
			name: "Test BA",
			slug: "test-ba",
			leader: 2,
			introduction: "",
			image: null,
			focus: "",
		},
		deletion_requested: false,
		deletion_request_id: null,
		created_at: new Date(),
		updated_at: new Date(),
		...overrides,
	} as IProjectData;
}

// Mock document
const mockDocument: IMainDoc = {
	id: 1,
	kind: "concept_plan",
	created_year: 2024,
	created_at: new Date("2024-01-01T00:00:00Z"),
	updated_at: new Date("2024-01-01T00:00:00Z"),
	status: "draft",
	creator: 1,
	modifier: 1,
	project_lead_approval_granted: false,
	business_area_lead_approval_granted: false,
	directorate_approval_granted: false,
	pdf_generation_in_progress: false,
	pdf: { file: "" },
	project: {
		id: 1,
		kind: "science",
		title: "Test Project",
		status: "active",
	} as IMainDoc["project"],
};

describe("UnifiedDocumentActionModal", () => {
	const mockOnClose = vi.fn();
	const mockOnSubmit = vi.fn();
	const mockProject = createMockProject({ id: 1, title: "Test Project" });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Submit action", () => {
		it("should render submit modal with correct title and description", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="submit"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="project_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			expect(
				screen.getByText("Submit concept plan for Approval")
			).toBeInTheDocument();
			expect(
				screen.getByText(
					"Submit this document for approval by the Business Area Lead."
				)
			).toBeInTheDocument();
		});

		it("should have optional comment field", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="submit"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="project_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			expect(screen.getByLabelText("Comment (optional)")).toBeInTheDocument();
		});

		it("should have email notification checkbox checked by default", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="submit"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="project_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const checkbox = screen.getByRole("checkbox", {
				name: /send email notification to business area lead/i,
			});
			expect(checkbox).toBeChecked();
		});

		it("should submit with comment and email notification", async () => {
			const user = userEvent.setup();

			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="submit"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="project_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const commentField = screen.getByLabelText("Comment (optional)");
			await user.type(commentField, "Ready for review");

			const submitButton = screen.getByRole("button", {
				name: /submit for approval/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledWith({
					action: "submit",
					comment: "Ready for review",
					sendEmail: true,
				});
			});
		});

		it("should allow unchecking email notification", async () => {
			const user = userEvent.setup();

			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="submit"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="project_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const checkbox = screen.getByRole("checkbox");
			await user.click(checkbox);

			const submitButton = screen.getByRole("button", {
				name: /submit for approval/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledWith({
					action: "submit",
					comment: "",
					sendEmail: false,
				});
			});
		});
	});

	describe("Approve action", () => {
		it("should render approve modal at business_area_lead stage", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="approve"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			expect(
				screen.getByText("Approve concept plan (Business Area Lead)")
			).toBeInTheDocument();
			expect(
				screen.getByText(
					"Approve this document and forward to Directorate for final approval."
				)
			).toBeInTheDocument();
		});

		it("should show final approval info at directorate stage", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="approve"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="directorate"
					onSubmit={mockOnSubmit}
				/>
			);

			expect(
				screen.getByText(/this is the final approval stage/i)
			).toBeInTheDocument();
		});

		it("should submit approval with comment", async () => {
			const user = userEvent.setup();

			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="approve"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const commentField = screen.getByLabelText("Comment (optional)");
			await user.type(commentField, "Looks good");

			const approveButton = screen.getByRole("button", { name: /^approve$/i });
			await user.click(approveButton);

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledWith({
					action: "approve",
					comment: "Looks good",
					sendEmail: true,
				});
			});
		});
	});

	describe("Recall action", () => {
		it("should render recall modal with correct content", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="recall"
					documentType="projectplan"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			expect(
				screen.getByText("Recall project plan Approval")
			).toBeInTheDocument();
			expect(
				screen.getByText(
					"Recall your approval and return the document to the previous stage."
				)
			).toBeInTheDocument();
		});

		it("should have optional reason field", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="recall"
					documentType="projectplan"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			expect(
				screen.getByLabelText("Reason for recall (optional)")
			).toBeInTheDocument();
		});

		it("should submit recall with reason", async () => {
			const user = userEvent.setup();

			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="recall"
					documentType="projectplan"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const reasonField = screen.getByLabelText("Reason for recall (optional)");
			await user.type(reasonField, "Need to review budget");

			const recallButton = screen.getByRole("button", {
				name: /recall approval/i,
			});
			await user.click(recallButton);

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledWith({
					action: "recall",
					comment: "Need to review budget",
					sendEmail: true,
				});
			});
		});
	});

	describe("Send back action", () => {
		it("should render send back modal with warning", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="send_back"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			expect(
				screen.getByText("Send concept plan Back for Revisions")
			).toBeInTheDocument();
			expect(
				screen.getByText(
					/this will send the document back to the project lead/i
				)
			).toBeInTheDocument();
		});

		it("should have required reason field", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="send_back"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const reasonField = screen.getByLabelText(
				"Reason for sending back (required)"
			);
			expect(reasonField).toBeRequired();
		});

		it("should not submit without reason", async () => {
			const user = userEvent.setup();

			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="send_back"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const sendBackButton = screen.getByRole("button", { name: /send back/i });
			await user.click(sendBackButton);

			// Form validation should prevent submission
			expect(mockOnSubmit).not.toHaveBeenCalled();
		});

		it("should submit with required reason", async () => {
			const user = userEvent.setup();

			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="send_back"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const reasonField = screen.getByLabelText(
				"Reason for sending back (required)"
			);
			await user.type(reasonField, "Budget needs revision");

			const sendBackButton = screen.getByRole("button", { name: /send back/i });
			await user.click(sendBackButton);

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledWith({
					action: "send_back",
					reason: "Budget needs revision",
					sendEmail: true,
				});
			});
		});
	});

	describe("Reopen action", () => {
		it("should render reopen modal", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="reopen"
					documentType="projectclosure"
					document={mockDocument}
					project={mockProject}
					currentStage="complete"
					onSubmit={mockOnSubmit}
				/>
			);

			expect(
				screen.getByRole("heading", { name: "Reopen Project" })
			).toBeInTheDocument();
			expect(
				screen.getByText(
					"Reopen this project by removing the project closure document."
				)
			).toBeInTheDocument();
		});

		it("should submit reopen with optional reason", async () => {
			const user = userEvent.setup();

			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="reopen"
					documentType="projectclosure"
					document={mockDocument}
					project={mockProject}
					currentStage="complete"
					onSubmit={mockOnSubmit}
				/>
			);

			const reasonField = screen.getByLabelText(
				"Reason for reopening (optional)"
			);
			await user.type(reasonField, "Additional work required");

			const reopenButton = screen.getByRole("button", {
				name: /reopen project/i,
			});
			await user.click(reopenButton);

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledWith({
					action: "reopen",
					comment: "Additional work required",
					sendEmail: true,
				});
			});
		});
	});

	describe("Modal interactions", () => {
		it("should call onClose when cancel button is clicked", async () => {
			const user = userEvent.setup();

			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="submit"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="project_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			await user.click(cancelButton);

			expect(mockOnClose).toHaveBeenCalled();
		});

		it("should disable buttons when isSubmitting is true", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="submit"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="project_lead"
					onSubmit={mockOnSubmit}
					isSubmitting={true}
				/>
			);

			const submitButton = screen.getByRole("button", { name: /processing/i });
			const cancelButton = screen.getByRole("button", { name: /cancel/i });

			expect(submitButton).toBeDisabled();
			expect(cancelButton).toBeDisabled();
		});

		it("should show processing text when submitting", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="approve"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
					isSubmitting={true}
				/>
			);

			expect(screen.getByText("Processing...")).toBeInTheDocument();
		});

		it("should not render when isOpen is false", () => {
			const { container } = render(
				<UnifiedDocumentActionModal
					isOpen={false}
					onClose={mockOnClose}
					action="submit"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="project_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			// Dialog should not be visible
			expect(
				container.querySelector('[role="dialog"]')
			).not.toBeInTheDocument();
		});
	});

	describe("Button colours", () => {
		it("should use green colour for submit action", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="submit"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="project_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const submitButton = screen.getByRole("button", {
				name: /submit for approval/i,
			});
			expect(submitButton).toHaveClass("bg-green-600");
		});

		it("should use green colour for approve action", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="approve"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const approveButton = screen.getByRole("button", { name: /^approve$/i });
			expect(approveButton).toHaveClass("bg-green-600");
		});

		it("should use blue colour for recall action", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="recall"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const recallButton = screen.getByRole("button", {
				name: /recall approval/i,
			});
			expect(recallButton).toHaveClass("bg-blue-600");
		});

		it("should use orange colour for send_back action", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="send_back"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const sendBackButton = screen.getByRole("button", { name: /send back/i });
			expect(sendBackButton).toHaveClass("bg-orange-600");
		});

		it("should use orange colour for reopen action", () => {
			render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="reopen"
					documentType="projectclosure"
					document={mockDocument}
					project={mockProject}
					currentStage="complete"
					onSubmit={mockOnSubmit}
				/>
			);

			const reopenButton = screen.getByRole("button", {
				name: /reopen project/i,
			});
			expect(reopenButton).toHaveClass("bg-orange-600");
		});
	});

	describe("Accessibility", () => {
		it("should have no accessibility violations - submit action", async () => {
			const { container } = render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="submit"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="project_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have no accessibility violations - approve action", async () => {
			const { container } = render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="approve"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have no accessibility violations - recall action", async () => {
			const { container } = render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="recall"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have no accessibility violations - send_back action", async () => {
			const { container } = render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="send_back"
					documentType="concept"
					document={mockDocument}
					project={mockProject}
					currentStage="business_area_lead"
					onSubmit={mockOnSubmit}
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});

		it("should have no accessibility violations - reopen action", async () => {
			const { container } = render(
				<UnifiedDocumentActionModal
					isOpen={true}
					onClose={mockOnClose}
					action="reopen"
					documentType="projectclosure"
					document={mockDocument}
					project={mockProject}
					currentStage="complete"
					onSubmit={mockOnSubmit}
				/>
			);

			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});
});
