import { describe, it, expect } from "vitest";
import {
	BREAKPOINTS,
	getCurrentBreakpoint,
	isAtLeast,
	isBelow,
} from "./breakpoints";

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

describe("getCurrentBreakpoint", () => {
	it("should return 4xl for 3840px (4K)", () => {
		expect(getCurrentBreakpoint(3840)).toBe("4xl");
	});

	it("should return 4xl for widths >= 3200px", () => {
		expect(getCurrentBreakpoint(3200)).toBe("4xl");
		expect(getCurrentBreakpoint(3500)).toBe("4xl");
		expect(getCurrentBreakpoint(3840)).toBe("4xl");
	});

	it("should return 3xl for widths between 2200-3199px", () => {
		expect(getCurrentBreakpoint(2200)).toBe("3xl");
		expect(getCurrentBreakpoint(2500)).toBe("3xl");
		expect(getCurrentBreakpoint(3199)).toBe("3xl");
	});

	it("should return 2xl for widths between 1880-2199px", () => {
		expect(getCurrentBreakpoint(1880)).toBe("2xl");
		expect(getCurrentBreakpoint(2000)).toBe("2xl");
		expect(getCurrentBreakpoint(2199)).toBe("2xl");
	});

	it("should return xl for widths between 1600-1879px", () => {
		expect(getCurrentBreakpoint(1600)).toBe("xl");
		expect(getCurrentBreakpoint(1700)).toBe("xl");
		expect(getCurrentBreakpoint(1879)).toBe("xl");
	});

	it("should return lg for widths between 1024-1599px", () => {
		expect(getCurrentBreakpoint(1024)).toBe("lg");
		expect(getCurrentBreakpoint(1100)).toBe("lg");
		expect(getCurrentBreakpoint(1599)).toBe("lg");
	});

	it("should return md for widths between 768-1023px", () => {
		expect(getCurrentBreakpoint(768)).toBe("md");
		expect(getCurrentBreakpoint(900)).toBe("md");
		expect(getCurrentBreakpoint(1023)).toBe("md");
	});

	it("should return sm for widths between 640-767px", () => {
		expect(getCurrentBreakpoint(640)).toBe("sm");
		expect(getCurrentBreakpoint(700)).toBe("sm");
		expect(getCurrentBreakpoint(767)).toBe("sm");
	});

	it("should return 2xs for widths < 640px", () => {
		expect(getCurrentBreakpoint(0)).toBe("2xs");
		expect(getCurrentBreakpoint(320)).toBe("2xs");
		expect(getCurrentBreakpoint(639)).toBe("2xs");
	});

	it("should handle edge cases", () => {
		expect(getCurrentBreakpoint(0)).toBe("2xs");
		expect(getCurrentBreakpoint(-100)).toBe("2xs");
		expect(getCurrentBreakpoint(10000)).toBe("4xl");
	});
});

describe("isAtLeast", () => {
	it("should work with 4xl breakpoint", () => {
		expect(isAtLeast(3200, "4xl")).toBe(true);
		expect(isAtLeast(3199, "4xl")).toBe(false);
		expect(isAtLeast(3840, "4xl")).toBe(true);
	});

	it("should work with 3xl breakpoint", () => {
		expect(isAtLeast(2200, "3xl")).toBe(true);
		expect(isAtLeast(2199, "3xl")).toBe(false);
		expect(isAtLeast(3000, "3xl")).toBe(true);
	});

	it("should work with 2xl breakpoint", () => {
		expect(isAtLeast(1880, "2xl")).toBe(true);
		expect(isAtLeast(1879, "2xl")).toBe(false);
		expect(isAtLeast(2000, "2xl")).toBe(true);
	});

	it("should work with xl breakpoint", () => {
		expect(isAtLeast(1600, "xl")).toBe(true);
		expect(isAtLeast(1599, "xl")).toBe(false);
	});

	it("should work with all breakpoints", () => {
		expect(isAtLeast(0, "2xs")).toBe(true);
		expect(isAtLeast(320, "xs")).toBe(true);
		expect(isAtLeast(640, "sm")).toBe(true);
		expect(isAtLeast(768, "md")).toBe(true);
		expect(isAtLeast(1024, "lg")).toBe(true);
	});
});

describe("isBelow", () => {
	it("should work with 3xl breakpoint", () => {
		expect(isBelow(2199, "3xl")).toBe(true);
		expect(isBelow(2200, "3xl")).toBe(false);
		expect(isBelow(3840, "3xl")).toBe(false);
	});

	it("should work with 2xl breakpoint", () => {
		expect(isBelow(1879, "2xl")).toBe(true);
		expect(isBelow(1880, "2xl")).toBe(false);
		expect(isBelow(2000, "2xl")).toBe(false);
	});

	it("should work with xl breakpoint", () => {
		expect(isBelow(1599, "xl")).toBe(true);
		expect(isBelow(1600, "xl")).toBe(false);
	});

	it("should work with all breakpoints", () => {
		expect(isBelow(-1, "2xs")).toBe(true);
		expect(isBelow(319, "xs")).toBe(true);
		expect(isBelow(639, "sm")).toBe(true);
		expect(isBelow(767, "md")).toBe(true);
		expect(isBelow(1023, "lg")).toBe(true);
	});
});
