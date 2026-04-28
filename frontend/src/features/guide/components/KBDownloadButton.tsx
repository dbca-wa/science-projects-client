/**
 * Knowledge Base PDF Download Button
 *
 * Opens a print-optimised view of the current category's articles
 * and triggers the browser's print dialog (Save as PDF).
 * Uses a content hash to set a unique filename with timestamp.
 */
import { Download } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { IGuideSection } from "../types/guide.types";

interface KBDownloadButtonProps {
	section: IGuideSection;
}

/** Simple string hash for content change detection */
const hashContent = (content: string): string => {
	let hash = 0;
	for (let i = 0; i < content.length; i++) {
		const char = content.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}
	return Math.abs(hash).toString(36);
};

export const KBDownloadButton = ({ section }: KBDownloadButtonProps) => {
	const handleDownload = () => {
		// Build the content hash for cache identification
		const allContent = section.content_fields
			.map((f) => `${f.title ?? ""}${f.description ?? ""}`)
			.join("");
		const contentHash = hashContent(allContent);
		const timestamp = new Date()
			.toISOString()
			.slice(0, 19)
			.replace(/[T:]/g, "-");
		const filename = `SPMS-KB-${section.title.replace(/[^a-zA-Z0-9]/g, "-")}-${timestamp}-${contentHash}`;

		// Build print-optimised HTML
		const articlesHtml = section.content_fields
			.map(
				(field) =>
					`<div style="margin-bottom:24px;page-break-inside:avoid;">` +
					`<h2 style="font-size:18px;font-weight:600;margin-bottom:8px;color:#1e293b;">` +
					`${field.title ?? field.field_key}</h2>` +
					`<div style="font-size:14px;line-height:1.6;color:#334155;">` +
					`${field.description ?? "<em>No content</em>"}</div></div>`
			)
			.join(
				'<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">'
			);

		const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${filename}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 24px; color: #1e293b; }
  h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  img { max-width: 100%; border-radius: 8px; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style>
</head>
<body>
<h1>${section.title}</h1>
<p class="subtitle">${section.description} &mdash; SPMS Knowledge Base</p>
${articlesHtml}
<div class="footer">Generated from SPMS Knowledge Base &mdash; ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</div>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

		const printWindow = window.open("", "_blank");
		if (printWindow) {
			printWindow.document.write(html);
			printWindow.document.close();
		}
	};

	if (section.content_fields.length === 0) return null;

	return (
		<Button
			variant="outline"
			size="sm"
			className="gap-1.5"
			onClick={handleDownload}
			aria-label={`Download ${section.title} as PDF`}
		>
			<Download className="h-4 w-4" />
			Download PDF
		</Button>
	);
};
