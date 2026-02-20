/**
 * Page test utilities
 *
 * Provides utilities for testing pages with routing, query client, and accessibility
 */

import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, type MemoryRouterProps } from "react-router";
import type { ReactElement, ReactNode } from "react";
import { axe } from "./axe-utils";

/**
 * Options for rendering pages in tests
 */
export interface PageTestOptions extends Omit<RenderOptions, "wrapper"> {
	/**
	 * Initial route entries for MemoryRouter
	 */
	initialEntries?: MemoryRouterProps["initialEntries"];
	/**
	 * Initial index for MemoryRouter
	 */
	initialIndex?: MemoryRouterProps["initialIndex"];
	/**
	 * Custom QueryClient instance
	 */
	queryClient?: QueryClient;
}

/**
 * Create a test wrapper with QueryClient and Router
 */
export function createTestWrapper(options: PageTestOptions = {}) {
	const { initialEntries = ["/"], initialIndex, queryClient } = options;

	const testQueryClient =
		queryClient ||
		new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
					gcTime: 0,
					staleTime: 0,
				},
				mutations: {
					retry: false,
				},
			},
		});

	function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={testQueryClient}>
				<MemoryRouter
					initialEntries={initialEntries}
					initialIndex={initialIndex}
				>
					{children}
				</MemoryRouter>
			</QueryClientProvider>
		);
	}

	return Wrapper;
}

/**
 * Render a page component with all necessary providers
 */
export function renderPage(ui: ReactElement, options: PageTestOptions = {}) {
	const { initialEntries, initialIndex, queryClient, ...renderOptions } =
		options;

	const Wrapper = createTestWrapper({
		initialEntries,
		initialIndex,
		queryClient,
	});

	return {
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
		queryClient:
			queryClient ||
			new QueryClient({
				defaultOptions: {
					queries: { retry: false, gcTime: 0, staleTime: 0 },
					mutations: { retry: false },
				},
			}),
	};
}

/**
 * Run accessibility tests on a rendered component
 *
 * @example
 * ```typescript
 * const { container } = renderPage(<MyPage />);
 * const results = await testAccessibility(container);
 * expect(results).toHaveNoViolations();
 * ```
 */
export async function testAccessibility(container: Element | Document) {
	return await axe(container);
}

/**
 * Render page and run accessibility tests
 *
 * @example
 * ```typescript
 * const { results } = await renderPageWithA11y(<MyPage />);
 * expect(results).toHaveNoViolations();
 * ```
 */
export async function renderPageWithA11y(
	ui: ReactElement,
	options: PageTestOptions = {}
) {
	const renderResult = renderPage(ui, options);
	const results = await testAccessibility(renderResult.container);

	return {
		...renderResult,
		results,
	};
}
