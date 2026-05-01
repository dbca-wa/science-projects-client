import { useEffect, useRef, useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNewCycleEmailPreview } from "@/shared/hooks/queries/useBumpEmails";

interface NewCycleEmailPreviewProps {
	/** The custom message HTML to preview (already debounced by the parent) */
	customMessage?: string;
	divisionName: string;
}

const DEFAULT_TEXT =
	"Please log in to SPMS to begin updating your project reports for this cycle.";

/**
 * Email preview — renders the actual Django email template in an iframe.
 *
 * Fetches the full template HTML once on mount (with no custom message).
 * On subsequent custom message changes, updates ONLY the [data-custom-message]
 * element inside the iframe's DOM — no full iframe reload, no confetti replay.
 */
export const NewCycleEmailPreview = ({
	customMessage,
	divisionName,
}: NewCycleEmailPreviewProps) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [iframeLoaded, setIframeLoaded] = useState(false);

	// Fetch the template once with no custom message (gets the default layout)
	const { data, isLoading } = useNewCycleEmailPreview(
		true,
		"", // Always fetch with empty — we inject the custom message via DOM
		divisionName
	);

	const resizeIframe = useCallback(() => {
		const iframe = iframeRef.current;
		if (!iframe) return;
		try {
			const doc = iframe.contentDocument || iframe.contentWindow?.document;
			if (doc?.body) {
				iframe.style.height = "0px";
				const height =
					doc.documentElement.scrollHeight || doc.body.scrollHeight;
				iframe.style.height = `${height + 16}px`;
			}
		} catch {
			iframe.style.height = "900px";
		}
	}, []);

	// Load the template into the iframe once
	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe || !data?.html) return;

		const handleLoad = () => {
			setIframeLoaded(true);
			resizeIframe();
			setTimeout(resizeIframe, 200);
			setTimeout(resizeIframe, 500);
		};

		iframe.addEventListener("load", handleLoad);
		// Only set srcDoc once — subsequent updates go through DOM manipulation
		if (!iframeLoaded) {
			iframe.srcdoc = data.html;
		}

		return () => iframe.removeEventListener("load", handleLoad);
	}, [data?.html, iframeLoaded, resizeIframe]);

	// Update just the custom message element inside the iframe — no full reload
	useEffect(() => {
		if (!iframeLoaded) return;
		const iframe = iframeRef.current;
		if (!iframe) return;

		try {
			const doc = iframe.contentDocument || iframe.contentWindow?.document;
			if (!doc) return;

			const messageEl = doc.querySelector("[data-custom-message]");
			if (!messageEl) return;

			if (customMessage && customMessage.trim()) {
				// Replace with custom message content
				messageEl.innerHTML = customMessage;
				// Switch to div styling (left-aligned) if it was a <p>
				if (messageEl.tagName === "P") {
					(messageEl as HTMLElement).style.textAlign = "left";
				}
			} else {
				// Restore default text
				messageEl.innerHTML = DEFAULT_TEXT;
				if (messageEl.tagName === "P") {
					(messageEl as HTMLElement).style.textAlign = "";
				}
			}

			// Resize after content change
			resizeIframe();
		} catch {
			// Cross-origin — can't access iframe DOM
		}
	}, [customMessage, iframeLoaded, resizeIframe]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!data?.html) return null;

	return (
		<iframe
			ref={iframeRef}
			title="Email preview"
			className="w-full border rounded-lg bg-white"
			sandbox="allow-same-origin allow-scripts"
			style={{ border: "none", overflow: "hidden" }}
		/>
	);
};
