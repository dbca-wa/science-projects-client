import { useEffect, useRef, useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNewCycleEmailPreview } from "@/shared/hooks/queries/useBumpEmails";

interface NewCycleEmailPreviewProps {
	customMessage?: string;
	divisionName: string;
}

const DEFAULT_TEXT =
	"Please log in to SPMS to begin updating your project reports for this cycle.";

/**
 * Email preview — renders the actual Django email template in an iframe.
 * Fetches the template once, then injects custom message via DOM manipulation.
 * Uses a minimum height with progressive resize to avoid the squished-iframe bug.
 */
export const NewCycleEmailPreview = ({
	customMessage,
	divisionName,
}: NewCycleEmailPreviewProps) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [iframeReady, setIframeReady] = useState(false);
	const [iframeHeight, setIframeHeight] = useState(1200);
	const customMessageRef = useRef(customMessage);
	customMessageRef.current = customMessage;

	const { data, isLoading } = useNewCycleEmailPreview(true, "", divisionName);

	const measureHeight = useCallback(() => {
		const iframe = iframeRef.current;
		if (!iframe) return;
		try {
			const doc = iframe.contentDocument || iframe.contentWindow?.document;
			if (!doc?.body) return;

			// Temporarily collapse to measure true content height
			// (scrollHeight includes the iframe's own height, causing growth loops)
			const prevHeight = iframe.style.height;
			iframe.style.height = "0px";
			const h = doc.documentElement.scrollHeight;
			if (h > 100) {
				iframe.style.height = `${h}px`;
				setIframeHeight(h);
			} else {
				// Measurement failed — restore previous
				iframe.style.height = prevHeight;
			}
		} catch {
			// Cross-origin fallback
		}
	}, []);

	const injectMessage = useCallback(
		(msg: string | undefined) => {
			const iframe = iframeRef.current;
			if (!iframe) return;
			try {
				const doc = iframe.contentDocument || iframe.contentWindow?.document;
				if (!doc) return;
				const el = doc.querySelector("[data-custom-message]");
				if (!el) return;

				if (msg && msg.trim()) {
					el.innerHTML = msg;
					if (el.tagName === "P") {
						(el as HTMLElement).style.textAlign = "left";
					}
				} else {
					el.innerHTML = DEFAULT_TEXT;
					if (el.tagName === "P") {
						(el as HTMLElement).style.textAlign = "";
					}
				}
				// Re-measure after content change
				setTimeout(measureHeight, 50);
			} catch {
				// Cross-origin fallback
			}
		},
		[measureHeight]
	);

	// Load the template into the iframe once
	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe || !data?.html) return;

		const handleLoad = () => {
			setIframeReady(true);
			injectMessage(customMessageRef.current);
			measureHeight();
			setTimeout(measureHeight, 100);
			setTimeout(measureHeight, 300);
			setTimeout(measureHeight, 600);
			setTimeout(measureHeight, 1000);
		};

		iframe.addEventListener("load", handleLoad);
		if (!iframeReady) {
			iframe.srcdoc = data.html;
		}

		return () => iframe.removeEventListener("load", handleLoad);
	}, [data?.html, iframeReady, measureHeight, injectMessage]);

	// Update the custom message when it changes
	useEffect(() => {
		if (!iframeReady) return;
		injectMessage(customMessage);
	}, [customMessage, iframeReady, injectMessage]);

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
			className="w-full rounded-lg bg-white"
			sandbox="allow-same-origin allow-scripts"
			scrolling="no"
			style={{ height: iframeHeight, border: "none", overflow: "hidden" }}
		/>
	);
};
