import { useEffect, useRef, useCallback, useState } from "react";
import { Loader2 } from "lucide-react";

interface EmailPreviewProps {
	/** The HTML content to render in the iframe */
	html: string | undefined;
	/** Whether the preview data is loading */
	isLoading: boolean;
	/** Custom message to inject into the template via data-custom-message attribute */
	customMessage?: string;
	/** Default text shown when no custom message is provided */
	defaultText?: string;
}

const DEFAULT_FALLBACK_TEXT = "Please log in to SPMS for more information.";

/**
 * Generic email preview component — renders an email template in an iframe
 * and injects custom message content via DOM manipulation.
 * Used by both the New Cycle page and the Announcement page.
 */
export const EmailPreview = ({
	html,
	isLoading,
	customMessage,
	defaultText = DEFAULT_FALLBACK_TEXT,
}: EmailPreviewProps) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [iframeReady, setIframeReady] = useState(false);
	const [iframeHeight, setIframeHeight] = useState(1200);
	const customMessageRef = useRef(customMessage);

	useEffect(() => {
		customMessageRef.current = customMessage;
	}, [customMessage]);

	const measureHeight = useCallback(() => {
		const iframe = iframeRef.current;
		if (!iframe) return;
		try {
			const doc = iframe.contentDocument || iframe.contentWindow?.document;
			if (!doc?.body) return;

			const prevHeight = iframe.style.height;
			iframe.style.height = "0px";
			const h = doc.documentElement.scrollHeight;
			if (h > 100) {
				iframe.style.height = `${h}px`;
				setIframeHeight(h);
			} else {
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
					el.innerHTML = defaultText;
					if (el.tagName === "P") {
						(el as HTMLElement).style.textAlign = "";
					}
				}
				setTimeout(measureHeight, 50);
			} catch {
				// Cross-origin fallback
			}
		},
		[measureHeight, defaultText]
	);

	// Load the template into the iframe once
	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe || !html) return;

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
			iframe.srcdoc = html;
		}

		return () => iframe.removeEventListener("load", handleLoad);
	}, [html, iframeReady, measureHeight, injectMessage]);

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

	if (!html) return null;

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
