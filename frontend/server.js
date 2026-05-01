import { serve } from "bun";

const server = serve({
	port: 3000,
	hostname: "0.0.0.0",
	async fetch(req) {
		const url = new URL(req.url);
		let filePath = url.pathname;

		// Default to index.html for SPA routing (paths without file extensions)
		if (filePath === "/" || !filePath.includes(".")) {
			filePath = "/index.html";
		}

		try {
			const file = Bun.file(`./dist${filePath}`);
			if (await file.exists()) {
				return new Response(file);
			}

			// For static asset requests (JS, CSS, images), return 404 — never serve
			// index.html for these. This prevents MIME type mismatch errors when
			// chunk hashes change between deployments.
			if (
				filePath.startsWith("/assets/") ||
				/\.(js|css|map|png|jpg|svg|woff2?|ttf|ico)$/i.test(filePath)
			) {
				return new Response("Not found", { status: 404 });
			}

			// Fallback to index.html for client-side routing (SPA)
			const indexFile = Bun.file("./dist/index.html");
			return new Response(indexFile);
		} catch (error) {
			return new Response("Internal server error", { status: 500 });
		}
	},
});

console.log(`Server running on http://localhost:${server.port}`);
