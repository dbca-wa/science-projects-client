/**
 * Tab navigation tests for ProjectDetailPage
 *
 * Verifies that the single-route architecture (/projects/:id/:tab?) correctly
 * derives the active tab from URL params, enabling proper back/forward navigation.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useParams } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Valid project tabs — mirrors the constant in ProjectDetailPage
const VALID_TABS = [
	"overview",
	"concept",
	"project",
	"progress",
	"student",
	"closure",
] as const;

/**
 * Lightweight component that mirrors ProjectDetailPage's tab derivation logic.
 * We test the derivation in isolation to avoid mocking the entire project API.
 */
const TabDerivationProbe = () => {
	const { tab } = useParams<{ id: string; tab?: string }>();
	const selectedTab =
		tab && VALID_TABS.includes(tab as (typeof VALID_TABS)[number])
			? tab
			: "overview";

	return <div data-testid="active-tab">{selectedTab}</div>;
};

/**
 * Renders the probe component inside a route that matches the single-route
 * pattern used in production: /projects/:id/:tab?
 */
const renderWithRoute = (url: string) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0 },
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[url]}>
				<Routes>
					<Route path="/projects/:id/:tab?" element={<TabDerivationProbe />} />
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe("ProjectDetailPage tab derivation", () => {
	it("defaults to 'overview' when no tab segment is present", () => {
		renderWithRoute("/projects/42");
		expect(screen.getByTestId("active-tab").textContent).toBe("overview");
	});

	it.each(VALID_TABS)("selects '%s' tab from URL param", (tab) => {
		renderWithRoute(`/projects/42/${tab}`);
		expect(screen.getByTestId("active-tab").textContent).toBe(tab);
	});

	it("falls back to 'overview' for an invalid tab segment", () => {
		renderWithRoute("/projects/42/nonexistent");
		expect(screen.getByTestId("active-tab").textContent).toBe("overview");
	});

	it("falls back to 'overview' for an empty tab segment", () => {
		renderWithRoute("/projects/42/");
		expect(screen.getByTestId("active-tab").textContent).toBe("overview");
	});
});

describe("Route configuration", () => {
	it("single :tab? route matches all valid tab URLs", () => {
		for (const tab of VALID_TABS) {
			const { unmount } = renderWithRoute(`/projects/123/${tab}`);
			expect(screen.getByTestId("active-tab").textContent).toBe(tab);
			unmount();
		}
	});

	it("single :tab? route matches the base project URL without a tab", () => {
		renderWithRoute("/projects/123");
		expect(screen.getByTestId("active-tab").textContent).toBe("overview");
	});
});
