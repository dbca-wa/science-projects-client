import { afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { JSDOM } from "jsdom";

// Setup JSDOM for tests that need DOM APIs
beforeAll(() => {
	if (typeof window === "undefined") {
		const jsdom = new JSDOM("<!doctype html><html><body></body></html>");
		global.window = jsdom.window as unknown as Window & typeof globalThis;
		global.document = jsdom.window.document;
	}
});

// Cleanup after each test (important for component tests in future phases)
afterEach(() => {
	cleanup();
});

// Custom matchers can be added here in future phases
// Example: expect.extend({ toBeWithinRange: ... })
