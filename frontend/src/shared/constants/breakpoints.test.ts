import { describe, it, expect } from "vitest";
import { BREAKPOINTS } from "./breakpoints";

describe("BREAKPOINTS", () => {
	it("should have 2xl at 1880px", () => {
		expect(BREAKPOINTS["2xl"]).toBe(1880);
	});

	it("should have 3xl at 2200px", () => {
		expect(BREAKPOINTS["3xl"]).toBe(2200);
	});

	it("should have 4xl at 3200px", () => {
		expect(BREAKPOINTS["4xl"]).toBe(3200);
	});

	it("should have breakpoints in ascending order", () => {
		const values = Object.values(BREAKPOINTS);
		for (let i = 1; i < values.length; i++) {
			expect(values[i]).toBeGreaterThan(values[i - 1]);
		}
	});

	it("should have all expected breakpoints", () => {
		expect(BREAKPOINTS["2xs"]).toBe(0);
		expect(BREAKPOINTS.xs).toBe(320);
		expect(BREAKPOINTS.sm).toBe(640);
		expect(BREAKPOINTS.md).toBe(768);
		expect(BREAKPOINTS.lg).toBe(1024);
		expect(BREAKPOINTS.xl).toBe(1600);
		expect(BREAKPOINTS["2xl"]).toBe(1880);
		expect(BREAKPOINTS["3xl"]).toBe(2200);
		expect(BREAKPOINTS["4xl"]).toBe(3200);
	});
});
