import { render, screen } from "@testing-library/react";
import { BannerPreview } from "./BannerPreview";

describe("BannerPreview", () => {
	it("renders the FY string correctly from reportYear", () => {
		render(<BannerPreview imageUrl={null} variant="full" reportYear={2025} />);

		expect(screen.getByText("FY 24-25")).toBeInTheDocument();
	});

	it("shows an image for the 'full' variant", () => {
		render(
			<BannerPreview
				imageUrl="https://example.com/banner.jpg"
				variant="full"
				reportYear={2025}
			/>
		);

		const img = screen.getByRole("img", { name: /cover page/i });
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", "https://example.com/banner.jpg");
	});

	it("shows an image for the 'cropped' variant", () => {
		render(
			<BannerPreview
				imageUrl="https://example.com/banner-cropped.jpg"
				variant="cropped"
				reportYear={2025}
			/>
		);

		const img = screen.getByRole("img", { name: /page header/i });
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute(
			"src",
			"https://example.com/banner-cropped.jpg"
		);
	});

	it("shows 'No banner' placeholder when imageUrl is null (full variant)", () => {
		render(<BannerPreview imageUrl={null} variant="full" reportYear={2025} />);

		expect(screen.getByText("No banner")).toBeInTheDocument();
	});

	it("shows 'No banner' placeholder when imageUrl is null (cropped variant)", () => {
		render(
			<BannerPreview imageUrl={null} variant="cropped" reportYear={2025} />
		);

		expect(screen.getByText("No banner")).toBeInTheDocument();
	});
});
