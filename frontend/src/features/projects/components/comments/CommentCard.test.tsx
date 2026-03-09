import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CommentCard } from "./CommentCard";
import type { IComment } from "@/shared/types/comment.types";

// Mock auth hook
vi.mock("@/features/auth", () => ({
	useCurrentUser: () => ({
		data: {
			id: 1,
			display_first_name: "Test",
			display_last_name: "User",
		},
	}),
}));

const createMockComment = (overrides?: Partial<IComment>): IComment => ({
	id: 1,
	user: {
		id: 2,
		display_first_name: "John",
		display_last_name: "Doe",
		email: "john.doe@example.com",
		image: "",
	},
	document: {
		id: 1,
		kind: "conceptplan",
		status: "active",
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	text: "<p>Test comment</p>",
	is_public: true,
	is_removed: false,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
	has_replies: false,
	reply_count: 0,
	parent_comment: null,
	replies: [],
	reactions: [],
	mentions: [],
	...overrides,
});

const renderWithProviders = (ui: React.ReactElement) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>{ui}</BrowserRouter>
		</QueryClientProvider>
	);
};

describe("CommentCard - Anchor Links", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render with anchor ID", () => {
		const comment = createMockComment({ id: 123 });
		const { container } = renderWithProviders(
			<CommentCard
				comment={comment}
				projectId={1}
				project={null}
				canComment={true}
			/>
		);

		const card = container.querySelector("#comment-123");
		expect(card).toBeInTheDocument();
	});

	it("should apply highlight styles when isHighlighted is true", () => {
		const comment = createMockComment();
		const { container } = renderWithProviders(
			<CommentCard
				comment={comment}
				projectId={1}
				project={null}
				canComment={true}
				isHighlighted={true}
			/>
		);

		const card = container.querySelector("#comment-1");
		expect(card).toHaveClass("ring-2");
		expect(card).toHaveClass("ring-blue-500");
	});

	it("should not apply highlight styles when isHighlighted is false", () => {
		const comment = createMockComment();
		const { container } = renderWithProviders(
			<CommentCard
				comment={comment}
				projectId={1}
				project={null}
				canComment={true}
				isHighlighted={false}
			/>
		);

		const card = container.querySelector("#comment-1");
		expect(card).not.toHaveClass("ring-2");
	});

	it("should render deleted comment with anchor ID", () => {
		const comment = createMockComment({ id: 456, is_removed: true });
		const { container } = renderWithProviders(
			<CommentCard
				comment={comment}
				projectId={1}
				project={null}
				canComment={true}
			/>
		);

		const card = container.querySelector("#comment-456");
		expect(card).toBeInTheDocument();
		expect(screen.getByText("[Comment deleted]")).toBeInTheDocument();
	});
});
