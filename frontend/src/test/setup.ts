import { afterEach, beforeAll, vi } from "vitest";
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
	
	// Mock localStorage with actual storage
	const storage: Record<string, string> = {};
	
	const localStorageMock = {
		getItem: vi.fn((key: string) => storage[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			storage[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete storage[key];
		}),
		clear: vi.fn(() => {
			Object.keys(storage).forEach(key => delete storage[key]);
		}),
		get length() {
			return Object.keys(storage).length;
		},
		key: vi.fn((index: number) => {
			const keys = Object.keys(storage);
			return keys[index] || null;
		}),
	};
	
	// Use Object.defineProperty to override read-only property
	Object.defineProperty(global, 'localStorage', {
		value: localStorageMock,
		writable: true,
		configurable: true,
	});
});

// Cleanup after each test (important for component tests in future phases)
afterEach(() => {
	cleanup();
	// Clear localStorage between tests
	localStorage.clear();
	// Reset mock call counts
	vi.clearAllMocks();
});

// Custom matchers can be added here in future phases
// Example: expect.extend({ toBeWithinRange: ... })
