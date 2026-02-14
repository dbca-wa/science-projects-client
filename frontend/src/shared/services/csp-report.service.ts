/**
 * CSP Reporting Service
 *
 * Handles Content Security Policy violation reports,
 * integrating with Sentry for production monitoring.
 */

import * as Sentry from "@sentry/react";

/**
 * CSP violation report as sent by browser
 */
export interface CSPViolationReport {
	/** Document URI where violation occurred */
	"document-uri": string;
	/** Referrer URL */
	referrer?: string;
	/** Directive that was violated */
	"violated-directive": string;
	/** Effective directive (more specific) */
	"effective-directive": string;
	/** Original CSP policy string */
	"original-policy": string;
	/** URI that was blocked */
	"blocked-uri": string;
	/** HTTP status code */
	"status-code": number;
	/** Source file where violation occurred */
	"source-file"?: string;
	/** Line number in source file */
	"line-number"?: number;
	/** Column number in source file */
	"column-number"?: number;
	/** Disposition (enforce or report) */
	disposition?: "enforce" | "report";
}

/**
 * CSP report payload wrapper
 */
export interface CSPReportPayload {
	"csp-report": CSPViolationReport;
}

/**
 * Process CSP violation report
 *
 * Routes the report to appropriate handler based on environment:
 * - Development: Logs to console
 * - Production: Sends to Sentry
 *
 * @param report - CSP violation report payload
 */
export function processCSPReport(report: CSPReportPayload): void {
	const violation = report["csp-report"];

	if (import.meta.env.DEV) {
		logCSPViolation(violation);
	} else {
		reportToSentry(violation);
	}
}

/**
 * Send CSP report to Sentry
 *
 * Captures CSP violations as warning-level messages in Sentry
 * with detailed context for debugging.
 *
 * @param report - CSP violation report
 */
export function reportToSentry(report: CSPViolationReport): void {
	Sentry.captureMessage("CSP Violation", {
		level: "warning",
		tags: {
			type: "csp-violation",
			directive: report["violated-directive"],
			effectiveDirective: report["effective-directive"],
		},
		extra: {
			documentUri: report["document-uri"],
			blockedUri: report["blocked-uri"],
			originalPolicy: report["original-policy"],
			sourceFile: report["source-file"],
			lineNumber: report["line-number"],
			columnNumber: report["column-number"],
			statusCode: report["status-code"],
			disposition: report.disposition,
		},
	});
}

/**
 * Log CSP violation in development
 *
 * Formats and logs CSP violation details to console
 * for debugging during development.
 *
 * @param report - CSP violation report
 */
export function logCSPViolation(report: CSPViolationReport): void {
	console.group("🚨 CSP Violation");
	console.error("Directive:", report["violated-directive"]);
	console.error("Effective:", report["effective-directive"]);
	console.error("Blocked:", report["blocked-uri"]);
	console.error("Document:", report["document-uri"]);

	if (report["source-file"]) {
		console.error(
			"Source:",
			`${report["source-file"]}:${report["line-number"]}:${report["column-number"]}`
		);
	}

	console.error("Policy:", report["original-policy"]);
	console.groupEnd();
}
