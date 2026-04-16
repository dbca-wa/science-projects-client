import { render, screen } from "@testing-library/react";
import { ChapterImagePreview } from "./ChapterImagePreview";

describe("ChapterImagePreview", () => {
	it("renders the chapter title text", () => {
		render(
			<ChapterImagePreview
				imageUrl={null}
				chapterTitle="Research Activities"
				isPlaceholder={false}
			/>
		);

		expect(screen.getByText("Research Activities")).toBeInTheDocument();
	});

	it("shows an image when imageUrl is provided", () => {
		render(
			<ChapterImagePreview
				imageUrl="https://example.com/chapter.jpg"
				chapterTitle="Partnerships"
				isPlaceholder={false}
			/>
		);

		const img = screen.getByRole("img", {
			name: /partnerships chapter image/i,
		});
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", "https://example.com/chapter.jpg");
	});

	it("shows 'No image' text when imageUrl is null", () => {
		render(
			<ChapterImagePreview
				imageUrl={null}
				chapterTitle="Collaborations"
				isPlaceholder={false}
			/>
		);

		expect(screen.getByText("No image")).toBeInTheDocument();
	});

	it("shows a dashed border overlay when isPlaceholder is true", () => {
		const { container } = render(
			<ChapterImagePreview
				imageUrl="https://example.com/placeholder.jpg"
				chapterTitle="Publications"
				isPlaceholder={true}
			/>
		);

		const img = screen.getByRole("img");
		expect(img).toHaveClass("opacity-50");

		const dashedOverlay = container.querySelector(".border-dashed");
		expect(dashedOverlay).toBeInTheDocument();
	});
});
