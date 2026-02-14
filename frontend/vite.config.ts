import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// CSP Configuration Types
type CSPSource =
	| "'self'"
	| "'none'"
	| "'unsafe-inline'"
	| "'unsafe-eval'"
	| `'nonce-${string}'`
	| "data:"
	| "blob:"
	| "http:"
	| "https:"
	| string;

interface CSPConfig {
	defaultSrc: CSPSource[];
	scriptSrc: CSPSource[];
	scriptSrcElem?: CSPSource[];
	workerSrc: CSPSource[];
	styleSrc: CSPSource[];
	imgSrc: CSPSource[];
	fontSrc: CSPSource[];
	connectSrc: CSPSource[];
	frameSrc: CSPSource[];
	objectSrc: CSPSource[];
	baseUri: CSPSource[];
	formAction: CSPSource[];
	reportUri?: string;
}

// CSP Configuration for different environments
const CSP_CONFIG = {
	development: {
		defaultSrc: ["'self'"],
		scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
		scriptSrcElem: ["'self'", "'unsafe-inline'", "blob:"],
		workerSrc: ["'self'", "blob:"],
		styleSrc: ["'self'", "'unsafe-inline'"],
		imgSrc: ["'self'", "data:", "blob:", "http:", "https:"],
		fontSrc: ["'self'", "data:"],
		connectSrc: ["'self'", "http://localhost:8000", "http://127.0.0.1:8000"],
		frameSrc: ["'none'"],
		objectSrc: ["'none'"],
		baseUri: ["'self'"],
		formAction: ["'self'"],
	} as CSPConfig,
	production: {
		defaultSrc: ["'self'"],
		scriptSrc: ["'self'", "blob:"],
		scriptSrcElem: ["'self'", "blob:"],
		workerSrc: ["'self'", "blob:"],
		styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind requires unsafe-inline
		imgSrc: ["'self'", "data:", "blob:", "https:"],
		fontSrc: ["'self'", "data:"],
		connectSrc: ["'self'", "https://*.ingest.us.sentry.io"], // Allow Sentry error reporting
		frameSrc: ["'none'"],
		objectSrc: ["'none'"],
		baseUri: ["'self'"],
		formAction: ["'self'"],
		reportUri: "/api/csp-report",
	} as CSPConfig,
};

/**
 * Generate CSP string from configuration
 */
function generateCSP(config: CSPConfig): string {
	const directives: string[] = [];

	// Add each directive
	if (config.defaultSrc.length > 0) {
		directives.push(`default-src ${config.defaultSrc.join(" ")}`);
	}
	if (config.scriptSrc.length > 0) {
		directives.push(`script-src ${config.scriptSrc.join(" ")}`);
	}
	if (config.scriptSrcElem && config.scriptSrcElem.length > 0) {
		directives.push(`script-src-elem ${config.scriptSrcElem.join(" ")}`);
	}
	if (config.workerSrc.length > 0) {
		directives.push(`worker-src ${config.workerSrc.join(" ")}`);
	}
	if (config.styleSrc.length > 0) {
		directives.push(`style-src ${config.styleSrc.join(" ")}`);
	}
	if (config.imgSrc.length > 0) {
		directives.push(`img-src ${config.imgSrc.join(" ")}`);
	}
	if (config.fontSrc.length > 0) {
		directives.push(`font-src ${config.fontSrc.join(" ")}`);
	}
	if (config.connectSrc.length > 0) {
		directives.push(`connect-src ${config.connectSrc.join(" ")}`);
	}
	if (config.frameSrc.length > 0) {
		directives.push(`frame-src ${config.frameSrc.join(" ")}`);
	}
	if (config.objectSrc.length > 0) {
		directives.push(`object-src ${config.objectSrc.join(" ")}`);
	}
	if (config.baseUri.length > 0) {
		directives.push(`base-uri ${config.baseUri.join(" ")}`);
	}
	if (config.formAction.length > 0) {
		directives.push(`form-action ${config.formAction.join(" ")}`);
	}
	if (config.reportUri) {
		directives.push(`report-uri ${config.reportUri}`);
	}

	return directives.join("; ");
}

// https://vite.dev/config/
export default defineConfig({
	preview: {
		host: true,
		port: 3000,
	},
	build: {
		minify: true,
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					// Vendor chunks
					"vendor-react": ["react", "react-dom", "react-router"],
					"vendor-query": ["@tanstack/react-query"],
					"vendor-mobx": ["mobx", "mobx-react-lite"],
					"vendor-ui": ["lucide-react", "sonner", "framer-motion"],
					"vendor-dompurify": ["dompurify"],
				},
			},
		},
	},
	plugins: [
		react(),
		tailwindcss(),
		// CSP configuration plugin
		{
			name: "html-transform",
			transformIndexHtml(html) {
				const isProduction = process.env.NODE_ENV === "production";
				const config = isProduction
					? CSP_CONFIG.production
					: CSP_CONFIG.development;

				const csp = generateCSP(config);

				// Replace the CSP meta tag content
				return html.replace(
					/<meta\s+http-equiv="Content-Security-Policy"\s+content="[^"]*"\s*\/>/,
					`<meta http-equiv="Content-Security-Policy" content="${csp}" />`
				);
			},
		},
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "json-summary", "html", "lcov"],
			exclude: [
				"node_modules/",
				"src/test/",
				"**/*.test.ts",
				"**/*.test.tsx",
				"**/*.d.ts",
				"**/types/",
			],
			thresholds: {
				lines: 40,
				functions: 40,
				branches: 40,
				statements: 40,
			},
		},
	},
});
