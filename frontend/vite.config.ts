import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

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
		// Add CSP headers for production builds
		{
			name: "html-transform",
			transformIndexHtml(html) {
				// In production, use stricter CSP
				if (process.env.NODE_ENV === "production") {
					return html.replace(
						/script-src 'self' 'unsafe-inline' 'unsafe-eval'/g,
						"script-src 'self'"
					);
				}
				return html;
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
			reporter: ["text", "json", "html", "lcov"],
			exclude: [
				"node_modules/",
				"src/test/",
				"**/*.test.ts",
				"**/*.test.tsx",
				"**/*.d.ts",
				"**/types/",
			],
			thresholds: {
				lines: 50,
				functions: 50,
				branches: 50,
				statements: 50,
			},
		},
	},
});
