import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatDate, formatDateTime, formatRelativeTime } from "./date.utils";

describe("formatDate", () => {
	it("should format ISO date string to DD/MM/YYYY", () => {
		expect(formatDate("2024-03-15T10:30:00Z")).toBe("15/03/2024");
	});

	it("should format Date object to DD/MM/YYYY", () => {
		const date = new Date("2024-03-15T10:30:00Z");
		expect(formatDate(date)).toBe("15/03/2024");
	});

	it("should pad single digit day and month with zero", () => {
		expect(formatDate("2024-01-05T10:30:00Z")).toBe("05/01/2024");
	});

	it("should handle null input", () => {
		expect(formatDate(null)).toBe("");
	});

	it("should handle undefined input", () => {
		expect(formatDate(undefined)).toBe("");
	});

	it("should handle invalid date string", () => {
		expect(formatDate("invalid-date")).toBe("");
	});

	it("should handle dates in different timezones", () => {
		// Date should be formatted based on local timezone
		const date = new Date("2024-12-31T23:00:00Z");
		const result = formatDate(date);
		// Result depends on local timezone, just verify it's a valid format
		expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
	});
});

describe("formatDateTime", () => {
	it("should format ISO date string to DD/MM/YYYY HH:MM", () => {
		const date = new Date("2024-03-15T10:30:00Z");
		const result = formatDateTime(date);
		// Result depends on local timezone, verify format
		expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
	});

	it("should format Date object to DD/MM/YYYY HH:MM", () => {
		const date = new Date("2024-03-15T10:30:00Z");
		const result = formatDateTime(date);
		expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
	});

	it("should pad single digit values with zero", () => {
		const date = new Date("2024-01-05T09:05:00Z");
		const result = formatDateTime(date);
		expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
	});

	it("should handle null input", () => {
		expect(formatDateTime(null)).toBe("");
	});

	it("should handle undefined input", () => {
		expect(formatDateTime(undefined)).toBe("");
	});

	it("should handle invalid date string", () => {
		expect(formatDateTime("invalid-date")).toBe("");
	});

	it("should format midnight correctly", () => {
		const date = new Date("2024-03-15T00:00:00Z");
		const result = formatDateTime(date);
		expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
	});
});

describe("formatRelativeTime", () => {
	beforeEach(() => {
		// Mock current time to 2024-03-15 12:00:00
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should return 'just now' for times less than 60 seconds ago", () => {
		const date = new Date("2024-03-15T11:59:30Z");
		expect(formatRelativeTime(date)).toBe("just now");
	});

	it("should return minutes for times less than 60 minutes ago", () => {
		const date = new Date("2024-03-15T11:45:00Z");
		expect(formatRelativeTime(date)).toBe("15 minutes ago");
	});

	it("should return singular 'minute' for 1 minute ago", () => {
		const date = new Date("2024-03-15T11:59:00Z");
		expect(formatRelativeTime(date)).toBe("1 minute ago");
	});

	it("should return hours for times less than 24 hours ago", () => {
		const date = new Date("2024-03-15T09:00:00Z");
		expect(formatRelativeTime(date)).toBe("3 hours ago");
	});

	it("should return singular 'hour' for 1 hour ago", () => {
		const date = new Date("2024-03-15T11:00:00Z");
		expect(formatRelativeTime(date)).toBe("1 hour ago");
	});

	it("should return days for times less than 7 days ago", () => {
		const date = new Date("2024-03-13T12:00:00Z");
		expect(formatRelativeTime(date)).toBe("2 days ago");
	});

	it("should return singular 'day' for 1 day ago", () => {
		const date = new Date("2024-03-14T12:00:00Z");
		expect(formatRelativeTime(date)).toBe("1 day ago");
	});

	it("should return weeks for times less than 30 days ago", () => {
		const date = new Date("2024-03-01T12:00:00Z");
		expect(formatRelativeTime(date)).toBe("2 weeks ago");
	});

	it("should return singular 'week' for 1 week ago", () => {
		const date = new Date("2024-03-08T12:00:00Z");
		expect(formatRelativeTime(date)).toBe("1 week ago");
	});

	it("should return months for times less than 365 days ago", () => {
		const date = new Date("2024-01-15T12:00:00Z");
		expect(formatRelativeTime(date)).toBe("2 months ago");
	});

	it("should return singular 'month' for 1 month ago", () => {
		const date = new Date("2024-02-10T12:00:00Z"); // 34 days ago
		expect(formatRelativeTime(date)).toBe("1 month ago");
	});

	it("should return years for times more than 365 days ago", () => {
		const date = new Date("2022-03-15T12:00:00Z");
		expect(formatRelativeTime(date)).toBe("2 years ago");
	});

	it("should return singular 'year' for 1 year ago", () => {
		const date = new Date("2023-03-15T12:00:00Z");
		expect(formatRelativeTime(date)).toBe("1 year ago");
	});

	it("should handle null input", () => {
		expect(formatRelativeTime(null)).toBe("");
	});

	it("should handle undefined input", () => {
		expect(formatRelativeTime(undefined)).toBe("");
	});

	it("should handle invalid date string", () => {
		expect(formatRelativeTime("invalid-date")).toBe("");
	});
});
