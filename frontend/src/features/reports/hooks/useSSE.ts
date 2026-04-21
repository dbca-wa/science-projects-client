import { useEffect, useRef, useState, useCallback } from "react";
import type { IProgressEvent } from "../types/report.types";

/** Options for the SSE hook */
export interface SSEOptions {
	url: string;
	enabled: boolean;
	onMessage: (event: IProgressEvent) => void;
	onError?: (error: Event) => void;
	onComplete?: () => void;
}

/**
 * Manages an EventSource connection for SSE progress streaming.
 *
 * Opens the connection when `enabled` is true, parses JSON progress
 * events, and automatically closes on terminal statuses.
 */
export function useSSE({
	url,
	enabled,
	onMessage,
	onError,
	onComplete,
}: SSEOptions): { isConnected: boolean; close: () => void } {
	const eventSourceRef = useRef<EventSource | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	// Store callbacks in refs so the effect doesn't re-trigger when they change
	const onMessageRef = useRef(onMessage);
	const onErrorRef = useRef(onError);
	const onCompleteRef = useRef(onComplete);

	useEffect(() => {
		onMessageRef.current = onMessage;
		onErrorRef.current = onError;
		onCompleteRef.current = onComplete;
	});

	const close = useCallback(() => {
		eventSourceRef.current?.close();
		eventSourceRef.current = null;
		setIsConnected(false);
	}, []);

	useEffect(() => {
		if (!enabled) {
			// Clean up without calling setState synchronously
			eventSourceRef.current?.close();
			eventSourceRef.current = null;
			return;
		}

		// eslint-disable-next-line react-hooks/set-state-in-effect -- SSE connection lifecycle
		setIsConnected(false);

		const es = new EventSource(url, { withCredentials: true });
		eventSourceRef.current = es;

		es.onopen = () => {
			setIsConnected(true);
		};

		es.onmessage = (event: MessageEvent) => {
			const data: IProgressEvent = JSON.parse(event.data as string);
			onMessageRef.current(data);

			if (
				data.status === "completed" ||
				data.status === "error" ||
				data.status === "idle"
			) {
				es.close();
				eventSourceRef.current = null;
				setIsConnected(false);

				if (data.status === "completed") {
					onCompleteRef.current?.();
				}
			}
		};

		es.onerror = (err: Event) => {
			onErrorRef.current?.(err);

			// EventSource auto-reconnects on transient errors.
			// Only update state if the connection is permanently closed.
			if (es.readyState === EventSource.CLOSED) {
				eventSourceRef.current = null;
				setIsConnected(false);
			}
		};

		return () => {
			es.close();
			eventSourceRef.current = null;
			setIsConnected(false);
		};
	}, [url, enabled, close]);

	return { isConnected, close };
}
