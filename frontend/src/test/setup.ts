import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Cleanup after each test (important for component tests in future phases)
afterEach(() => {
	cleanup();
});

// Custom matchers can be added here in future phases
// Example: expect.extend({ toBeWithinRange: ... })
