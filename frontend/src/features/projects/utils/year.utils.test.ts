import { describe, it, expect } from "vitest";
import { formatYearRange } from "./year.utils";

describe("formatYearRange", () => {
	describe("with different start and end years", () => {
		it("should return year range when years differ", () => {
			const start = new Date("2024-01-01");
			const end = new Date("2026-12-31");
			expect(formatYearRange(start, end)).toBe("2024-2026");
		});

		it("should handle string dates", () => {
			expect(formatYearRange("2024-01-01", "2026-12-31")).toBe("2024-2026");
		});

		it("should handle multi-year range", () => {
			const start = new Date("2020-01-01");
			const end = new Date("2025-12-31");
			expect(formatYearRange(start, end)).toBe("2020-2025");
		});
	});

	describe("with same start and end years", () => {
		it("should return single year when years are the same", () => {
			const start = new Date("2024-01-01");
			const end = new Date("2024-12-31");
			expect(formatYearRange(start, end)).toBe("2024");
		});

		it("should handle string dates with same year", () => {
			expect(formatYearRange("2024-01-01", "2024-06-30")).toBe("2024");
		});

		it("should handle same date", () => {
			const date = new Date("2024-06-15");
			expect(formatYearRange(date, date)).toBe("2024");
		});
	});

	describe("with no end date", () => {
		it("should return year with dash when end date is null", () => {
			const start = new Date("2024-01-01");
			expect(formatYearRange(start, null)).toBe("2024-");
		});

		it("should return year with dash when end date is undefined", () => {
			const start = new Date("2024-01-01");
			expect(formatYearRange(start, undefined)).toBe("2024-");
		});

		it("should handle string start date with no end", () => {
			expect(formatYearRange("2024-01-01", null)).toBe("2024-");
		});
	});

	describe("edge cases", () => {
		it("should handle dates at year boundaries", () => {
			const start = new Date("2024-12-31");
			const end = new Date("2025-01-01");
			expect(formatYearRange(start, end)).toBe("2024-2025");
		});

		it("should handle leap year dates", () => {
			const start = new Date("2024-02-29");
			const end = new Date("2025-02-28");
			expect(formatYearRange(start, end)).toBe("2024-2025");
		});

		it("should handle century change", () => {
			const start = new Date("1999-01-01");
			const end = new Date("2000-12-31");
			expect(formatYearRange(start, end)).toBe("1999-2000");
		});
	});
});
