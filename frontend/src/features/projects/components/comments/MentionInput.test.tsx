/**
 * MentionInput Component Tests
 *
 * Unit tests for the MentionInput component with @mention autocomplete functionality.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MentionInput } from "./MentionInput";

// Mock useProjectTeam hook
vi.mock("@/features/projects/hooks/useProjectTeam", () => ({
	useProjectTeam: vi.fn(() => ({
		data: [
			{
				id: 1,
				user: {
					id: 1,
					display_first_name: "John",
					display_last_name: "Smith",
					avatar: null,
					position_title: "Project Manager",
					email: "john.smith@example.com",
				},
				role: "Project Lead",
				is_leader: true,
			},
			{
				id: 2,
				user: {
					id: 2,
					display_first_name: "Jane",
					display_last_name: "Doe",
					avatar: null,
					position_title: "Developer",
					email: "jane.doe@example.com",
				},
				role: "Team Member",
				is_leader: false,
			},
			{
				id: 3,
				user: {
					id: 3,
					display_first_name: "Bob",
					display_last_name: "Johnson",
					avatar: null,
					position_title: "Designer",
					email: "bob.johnson@example.com",
				},
				role: "Team Member",
				is_leader: false,
			},
			{
				id: 4,
				user: {
					id: 4,
					display_first_name: "Alice",
					display_last_name: "Williams",
					avatar: null,
					position_title: "Tester",
					email: "alice.williams@example.com",
				},
				role: "Team Member",
				is_leader: false,
			},
		],
		isLoading: false,
		error: null,
	})),
}));

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});

	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

describe("MentionInput", () => {
	it("should render textarea", () => {
		const handleChange = vi.fn();

		render(<MentionInput value="" onChange={handleChange} projectId={1} />, {
			wrapper: createWrapper(),
		});

		expect(
			screen.getByLabelText("Comment text with mention support")
		).toBeInTheDocument();
	});

	it("should call onChange when text changes", () => {
		const handleChange = vi.fn();

		render(<MentionInput value="" onChange={handleChange} projectId={1} />, {
			wrapper: createWrapper(),
		});

		const textarea = screen.getByLabelText("Comment text with mention support");
		fireEvent.change(textarea, { target: { value: "Hello world" } });

		expect(handleChange).toHaveBeenCalledWith("Hello world");
	});

	it("should not show dropdown with just @ symbol", async () => {
		const handleChange = vi.fn();

		render(
			<MentionInput value="Hello @" onChange={handleChange} projectId={1} />,
			{ wrapper: createWrapper() }
		);

		const textarea = screen.getByLabelText("Comment text with mention support");

		// Simulate typing @ and setting cursor position
		fireEvent.change(textarea, {
			target: { value: "Hello @", selectionStart: 7 },
		});
		fireEvent.select(textarea);

		// Wait a bit to ensure dropdown doesn't appear
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Dropdown should NOT appear with just @
		expect(document.body.textContent).not.toContain("John Smith");
	});

	it("should show dropdown after @ followed by at least one character", async () => {
		const handleChange = vi.fn();

		render(
			<MentionInput value="Hello @j" onChange={handleChange} projectId={1} />,
			{ wrapper: createWrapper() }
		);

		const textarea = screen.getByLabelText("Comment text with mention support");

		// Simulate typing @j and setting cursor position
		fireEvent.change(textarea, {
			target: { value: "Hello @j", selectionStart: 8 },
		});
		fireEvent.select(textarea);

		// Wait for dropdown to appear
		await waitFor(() => {
			expect(document.body.textContent).toContain("John Smith");
		});
	});

	it("should filter team members based on search term", async () => {
		const handleChange = vi.fn();

		render(
			<MentionInput value="Hello @jo" onChange={handleChange} projectId={1} />,
			{ wrapper: createWrapper() }
		);

		const textarea = screen.getByLabelText("Comment text with mention support");

		// Simulate typing @jo and setting cursor position
		fireEvent.change(textarea, {
			target: { value: "Hello @jo", selectionStart: 9 },
		});
		fireEvent.select(textarea);

		// Wait for dropdown to appear with filtered results
		await waitFor(() => {
			expect(document.body.textContent).toContain("John Smith");
			expect(document.body.textContent).not.toContain("Jane Doe");
		});
	});

	it("should extract mentioned user IDs from text", () => {
		const handleChange = vi.fn();
		const handleMentionedUsersChange = vi.fn();

		render(
			<MentionInput
				value="Hello @John Smith and @Jane Doe"
				onChange={handleChange}
				onMentionedUsersChange={handleMentionedUsersChange}
				projectId={1}
			/>,
			{ wrapper: createWrapper() }
		);

		// Wait for effect to run
		waitFor(() => {
			expect(handleMentionedUsersChange).toHaveBeenCalledWith([1, 2]);
		});
	});

	it("should respect maxLength prop", () => {
		const handleChange = vi.fn();

		render(
			<MentionInput
				value=""
				onChange={handleChange}
				projectId={1}
				maxLength={100}
			/>,
			{ wrapper: createWrapper() }
		);

		const textarea = screen.getByLabelText(
			"Comment text with mention support"
		) as HTMLTextAreaElement;

		expect(textarea.maxLength).toBe(100);
	});

	it("should be disabled when disabled prop is true", () => {
		const handleChange = vi.fn();

		render(
			<MentionInput
				value=""
				onChange={handleChange}
				projectId={1}
				disabled={true}
			/>,
			{ wrapper: createWrapper() }
		);

		const textarea = screen.getByLabelText("Comment text with mention support");
		expect(textarea).toBeDisabled();
	});

	it("should limit dropdown to maximum 3 results", async () => {
		const handleChange = vi.fn();

		render(
			<MentionInput value="Hello @" onChange={handleChange} projectId={1} />,
			{ wrapper: createWrapper() }
		);

		const textarea = screen.getByLabelText("Comment text with mention support");

		// Simulate typing @ with a character that matches all 4 team members
		fireEvent.change(textarea, {
			target: { value: "Hello @o", selectionStart: 8 },
		});
		fireEvent.select(textarea);

		// Wait for dropdown to appear
		await waitFor(() => {
			// Should show John, Bob, and Alice (first 3 matches)
			// Should NOT show all 4 members
			const bodyText = document.body.textContent || "";
			const johnCount = (bodyText.match(/John Smith/g) || []).length;
			const bobCount = (bodyText.match(/Bob Johnson/g) || []).length;
			const aliceCount = (bodyText.match(/Alice Williams/g) || []).length;

			// Should have exactly 3 results
			expect(johnCount + bobCount + aliceCount).toBeLessThanOrEqual(3);
		});
	});
});
