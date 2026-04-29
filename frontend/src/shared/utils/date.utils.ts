/**
 * Date Formatting Utilities
 *
 * Utilities for formatting dates and times consistently across the application.
 */

/**
 * Format a date string to Australian date format (DD/MM/YYYY)
 *
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatDate(
	dateString: string | Date | null | undefined
): string {
	if (!dateString) return "";

	const date =
		typeof dateString === "string" ? new Date(dateString) : dateString;

	if (isNaN(date.getTime())) return "";

	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();

	return `${day}/${month}/${year}`;
}

/**
 * Format a date string to Australian date and time format (DD/MM/YYYY HH:MM)
 *
 * @param dateString - ISO date string or Date object
 * @returns Formatted date and time string (DD/MM/YYYY HH:MM)
 */
export function formatDateTime(
	dateString: string | Date | null | undefined
): string {
	if (!dateString) return "";

	const date =
		typeof dateString === "string" ? new Date(dateString) : dateString;

	if (isNaN(date.getTime())) return "";

	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format a date string to relative time (e.g., "2 days ago", "in 3 hours")
 *
 * @param dateString - ISO date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(
	dateString: string | Date | null | undefined
): string {
	if (!dateString) return "";

	const date =
		typeof dateString === "string" ? new Date(dateString) : dateString;

	if (isNaN(date.getTime())) return "";

	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSecs < 60) return "just now";
	if (diffMins < 60)
		return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
	if (diffHours < 24)
		return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7);
		return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
	}
	if (diffDays < 365) {
		const months = Math.floor(diffDays / 30);
		return `${months} month${months !== 1 ? "s" : ""} ago`;
	}

	const years = Math.floor(diffDays / 365);
	return `${years} year${years !== 1 ? "s" : ""} ago`;
}

/**
 * Format a date string to detailed datetime format (e.g., "9th January, 2025 @ 2:01PM")
 *
 * @param dateString - ISO date string or Date object
 * @returns Formatted detailed datetime string
 */
export function formatDetailedDateTime(
	dateString: string | Date | null | undefined
): string {
	if (!dateString) return "";

	const date =
		typeof dateString === "string" ? new Date(dateString) : dateString;

	if (isNaN(date.getTime())) return "";

	// Get day with ordinal suffix
	const day = date.getDate();
	const ordinal = getOrdinalSuffix(day);

	// Get month name
	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const month = monthNames[date.getMonth()];

	// Get year
	const year = date.getFullYear();

	// Get time in 12-hour format
	let hours = date.getHours();
	const minutes = date.getMinutes();
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12;
	hours = hours ? hours : 12; // Convert 0 to 12
	const minutesStr = minutes.toString().padStart(2, "0");

	return `${day}${ordinal} ${month}, ${year} @ ${hours}:${minutesStr}${ampm}`;
}

/**
 * Get ordinal suffix for a day number (e.g., 1st, 2nd, 3rd, 4th)
 *
 * @param day - Day number (1-31)
 * @returns Ordinal suffix (st, nd, rd, th)
 */
function getOrdinalSuffix(day: number): string {
	if (day > 3 && day < 21) return "th"; // 11th-20th
	switch (day % 10) {
		case 1:
			return "st";
		case 2:
			return "nd";
		case 3:
			return "rd";
		default:
			return "th";
	}
}

/**
 * Format a financial year as "FY YY-YY"
 *
 * The year parameter is the publication year (end of the financial year).
 * For example, year=2025 returns "FY 24-25".
 *
 * @param year - The financial year end (publication year)
 * @returns Formatted financial year label, or em dash for null/undefined
 */
export function getFinancialYearLabel(year: number | null | undefined): string {
	if (year == null) return "—";
	const startYY = String(year - 1).slice(-2);
	const endYY = String(year).slice(-2);
	return `FY ${startYY}-${endYY}`;
}
