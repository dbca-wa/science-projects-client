import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { MentionDisplay } from "./MentionDisplay";
import type { ICommentMention } from "@/shared/types/comment.types";

// Helper to create mock mention
const createMockMention = (
	id: number,
	userId: number,
	firstName: string,
	lastName: string
): ICommentMention => ({
	id,
	mentioned_user: {
		id: userId,
		display_first_name: firstName,
		display_last_name: lastName,
		email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
		image: "",
	},
	created_at: new Date().toISOString(),
});

describe("MentionDisplay", () => {
	it("should render plain text when no mentions", () => {
		render(
			<BrowserRouter>
				<MentionDisplay text="This is a plain comment" mentions={[]} />
			</BrowserRouter>
		);

		expect(screen.getByText("This is a plain comment")).toBeInTheDocument();
	});

	it("should render mention as link", () => {
		const mentions = [createMockMention(1, 10, "John", "Smith")];

		render(
			<BrowserRouter>
				<MentionDisplay
					text="Hey @John Smith, can you review this?"
					mentions={mentions}
				/>
			</BrowserRouter>
		);

		const link = screen.getByRole("link", { name: "@John Smith" });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/users/10");
		expect(link).toHaveClass("text-blue-600");
	});

	it("should render multiple mentions", () => {
		const mentions = [
			createMockMention(1, 10, "John", "Smith"),
			createMockMention(2, 20, "Jane", "Doe"),
		];

		render(
			<BrowserRouter>
				<MentionDisplay
					text="@John Smith and @Jane Doe, please review"
					mentions={mentions}
				/>
			</BrowserRouter>
		);

		const johnLink = screen.getByRole("link", { name: "@John Smith" });
		const janeLink = screen.getByRole("link", { name: "@Jane Doe" });

		expect(johnLink).toHaveAttribute("href", "/users/10");
		expect(janeLink).toHaveAttribute("href", "/users/20");
	});

	it("should preserve text before and after mentions", () => {
		const mentions = [createMockMention(1, 10, "John", "Smith")];

		render(
			<BrowserRouter>
				<MentionDisplay
					text="Hello @John Smith, how are you?"
					mentions={mentions}
				/>
			</BrowserRouter>
		);

		expect(screen.getByText("Hello")).toBeInTheDocument();
		expect(screen.getByText(", how are you?")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "@John Smith" })
		).toBeInTheDocument();
	});

	it("should handle mention at start of text", () => {
		const mentions = [createMockMention(1, 10, "John", "Smith")];

		render(
			<BrowserRouter>
				<MentionDisplay text="@John Smith is awesome" mentions={mentions} />
			</BrowserRouter>
		);

		const link = screen.getByRole("link", { name: "@John Smith" });
		expect(link).toBeInTheDocument();
		expect(screen.getByText(/is awesome/)).toBeInTheDocument();
	});

	it("should handle mention at end of text", () => {
		const mentions = [createMockMention(1, 10, "John", "Smith")];

		render(
			<BrowserRouter>
				<MentionDisplay text="Thanks @John Smith" mentions={mentions} />
			</BrowserRouter>
		);

		expect(screen.getByText(/Thanks/)).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "@John Smith" })
		).toBeInTheDocument();
	});

	it("should render mention as plain text if user ID not found", () => {
		// Empty mentions array, but text contains @mention
		render(
			<BrowserRouter>
				<MentionDisplay text="Hey @John Smith" mentions={[]} />
			</BrowserRouter>
		);

		// Should render as plain text since no mention data
		expect(screen.getByText("Hey @John Smith")).toBeInTheDocument();
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});

	it("should preserve whitespace and line breaks", () => {
		const mentions = [createMockMention(1, 10, "John", "Smith")];

		render(
			<BrowserRouter>
				<MentionDisplay
					text="Line 1\n@John Smith\nLine 3"
					mentions={mentions}
				/>
			</BrowserRouter>
		);

		const link = screen.getByRole("link", { name: "@John Smith" });
		expect(link).toBeInTheDocument();
	});
});
