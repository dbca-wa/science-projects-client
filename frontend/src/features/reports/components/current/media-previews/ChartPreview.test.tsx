import { render, screen } from "@testing-library/react";
import { ChartPreview } from "./ChartPreview";

describe("ChartPreview", () => {
	it("renders the 'Service Delivery Structure' heading", () => {
		render(<ChartPreview imageUrl={null} />);

		expect(screen.getByText("Service Delivery Structure")).toBeInTheDocument();
	});

	it("shows the chart image when imageUrl is provided", () => {
		render(<ChartPreview imageUrl="https://example.com/chart.png" />);

		const img = screen.getByRole("img", { name: /org chart/i });
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", "https://example.com/chart.png");
	});

	it("shows 'No chart uploaded' placeholder when imageUrl is null", () => {
		render(<ChartPreview imageUrl={null} />);

		expect(screen.getByText("No chart uploaded")).toBeInTheDocument();
	});
});
