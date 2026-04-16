import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSSE } from "./useSSE";
import type { IProgressEvent } from "../types/report.types";

/**
 * Mock EventSource since jsdom does not provide it.
 * Tracks instances so tests can simulate server-sent events.
 */
type EventHandler = ((event: MessageEvent) => void) | null;
type OpenHandler = (() => void) | null;
type ErrorHandler = ((event: Event) => void) | null;

interface MockEventSourceInstance {
	url: string;
	withCredentials: boolean;
	readyState: number;
	onopen: OpenHandler;
	onmessage: EventHandler;
	onerror: ErrorHandler;
	close: ReturnType<typeof vi.fn>;
}

let mockInstances: MockEventSourceInstance[] = [];

class MockEventSource implements MockEventSourceInstance {
	static readonly CONNECTING = 0;
	static readonly OPEN = 1;
	static readonly CLOSED = 2;

	url: string;
	withCredentials: boolean;
	readyState = MockEventSource.OPEN;
	onopen: OpenHandler = null;
	onmessage: EventHandler = null;
	onerror: ErrorHandler = null;
	close = vi.fn(() => {
		this.readyState = MockEventSource.CLOSED;
	});

	constructor(url: string, init?: { withCredentials?: boolean }) {
		this.url = url;
		this.withCredentials = init?.withCredentials ?? false;
		mockInstances.push(this);
		// Simulate async open
		queueMicrotask(() => this.onopen?.());
	}
}

vi.stubGlobal("EventSource", MockEventSource);

/** Helper to build a progress event payload */
function makeProgress(overrides: Partial<IProgressEvent> = {}): IProgressEvent {
	return {
		phase: "data_fetch",
		phase_label: "Fetching report data...",
		percentage: 30,
		generation_kind: "approved",
		status: "in_progress",
		...overrides,
	};
}

describe("useSSE", () => {
	beforeEach(() => {
		mockInstances = [];
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("connects when enabled is true", async () => {
		const onMessage = vi.fn();

		const { result } = renderHook(() =>
			useSSE({
				url: "http://localhost:8000/api/v1/reports/1/generation-progress",
				enabled: true,
				onMessage,
			})
		);

		// Should have created an EventSource instance
		expect(mockInstances).toHaveLength(1);
		expect(mockInstances[0].url).toBe(
			"http://localhost:8000/api/v1/reports/1/generation-progress"
		);
		expect(mockInstances[0].withCredentials).toBe(true);

		// Wait for onopen microtask
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});

		expect(result.current.isConnected).toBe(true);
	});

	it("disconnects when enabled becomes false", async () => {
		const onMessage = vi.fn();

		const { result, rerender } = renderHook(
			({ enabled }: { enabled: boolean }) =>
				useSSE({
					url: "http://localhost:8000/api/v1/reports/1/generation-progress",
					enabled,
					onMessage,
				}),
			{ initialProps: { enabled: true } }
		);

		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});

		expect(result.current.isConnected).toBe(true);
		const firstInstance = mockInstances[0];

		// Disable the hook
		rerender({ enabled: false });

		expect(firstInstance.close).toHaveBeenCalled();
		expect(result.current.isConnected).toBe(false);
	});

	it("parses JSON events and calls onMessage", async () => {
		const onMessage = vi.fn();

		renderHook(() =>
			useSSE({
				url: "http://localhost:8000/api/v1/reports/1/generation-progress",
				enabled: true,
				onMessage,
			})
		);

		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});

		const es = mockInstances[0];
		const progressEvent = makeProgress({
			percentage: 50,
			phase: "template_render",
		});

		// Simulate an SSE message
		act(() => {
			es.onmessage?.(
				new MessageEvent("message", { data: JSON.stringify(progressEvent) })
			);
		});

		expect(onMessage).toHaveBeenCalledWith(progressEvent);
	});

	it("closes on terminal statuses (completed, error, idle)", async () => {
		const terminalStatuses: IProgressEvent["status"][] = [
			"completed",
			"error",
			"idle",
		];

		for (const status of terminalStatuses) {
			mockInstances = [];
			const onMessage = vi.fn();
			const onComplete = vi.fn();

			const { result, unmount } = renderHook(() =>
				useSSE({
					url: "http://localhost:8000/api/v1/reports/1/generation-progress",
					enabled: true,
					onMessage,
					onComplete,
				})
			);

			await act(async () => {
				await new Promise((r) => setTimeout(r, 0));
			});

			const es = mockInstances[0];
			const event = makeProgress({ status });

			act(() => {
				es.onmessage?.(
					new MessageEvent("message", { data: JSON.stringify(event) })
				);
			});

			expect(es.close).toHaveBeenCalled();
			expect(result.current.isConnected).toBe(false);

			unmount();
		}
	});

	it("calls onComplete on completed status", async () => {
		const onMessage = vi.fn();
		const onComplete = vi.fn();

		renderHook(() =>
			useSSE({
				url: "http://localhost:8000/api/v1/reports/1/generation-progress",
				enabled: true,
				onMessage,
				onComplete,
			})
		);

		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});

		const es = mockInstances[0];
		const completedEvent = makeProgress({
			status: "completed",
			percentage: 100,
		});

		act(() => {
			es.onmessage?.(
				new MessageEvent("message", { data: JSON.stringify(completedEvent) })
			);
		});

		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it("does not call onComplete on error or idle status", async () => {
		const onMessage = vi.fn();
		const onComplete = vi.fn();

		renderHook(() =>
			useSSE({
				url: "http://localhost:8000/api/v1/reports/1/generation-progress",
				enabled: true,
				onMessage,
				onComplete,
			})
		);

		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});

		const es = mockInstances[0];

		act(() => {
			es.onmessage?.(
				new MessageEvent("message", {
					data: JSON.stringify(makeProgress({ status: "error" })),
				})
			);
		});

		expect(onComplete).not.toHaveBeenCalled();
	});

	it("cleans up EventSource on unmount", async () => {
		const onMessage = vi.fn();

		const { unmount } = renderHook(() =>
			useSSE({
				url: "http://localhost:8000/api/v1/reports/1/generation-progress",
				enabled: true,
				onMessage,
			})
		);

		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});

		const es = mockInstances[0];
		expect(es.close).not.toHaveBeenCalled();

		unmount();

		expect(es.close).toHaveBeenCalled();
	});

	it("calls onError when EventSource fires onerror with CLOSED readyState", async () => {
		const onMessage = vi.fn();
		const onError = vi.fn();

		const { result } = renderHook(() =>
			useSSE({
				url: "http://localhost:8000/api/v1/reports/1/generation-progress",
				enabled: true,
				onMessage,
				onError,
			})
		);

		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});

		const es = mockInstances[0];
		// Simulate permanent failure
		es.readyState = MockEventSource.CLOSED;

		act(() => {
			es.onerror?.(new Event("error"));
		});

		expect(onError).toHaveBeenCalled();
		expect(result.current.isConnected).toBe(false);
	});
});
