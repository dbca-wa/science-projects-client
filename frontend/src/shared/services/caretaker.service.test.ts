import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	requestCaretaker,
	cancelCaretakerRequest,
	getCaretakerCheck,
	getPendingCaretakerRequests,
} from "./caretaker.service";
import { apiClient } from "./api/client.service";

vi.mock("./api/client.service", () => ({
	apiClient: { get: vi.fn(), post: vi.fn() },
}));

describe("shared caretaker.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("requestCaretaker should POST to create endpoint", async () => {
		(apiClient.post as Mock).mockResolvedValue({ task_id: 10 });
		const result = await requestCaretaker({
			user_id: 1,
			caretaker_id: 2,
			reason: "leave",
		});
		expect(apiClient.post).toHaveBeenCalledWith(
			"caretakers/requests/create",
			expect.objectContaining({ user_id: 1, caretaker_id: 2 })
		);
		expect(result).toEqual({ task_id: 10 });
	});

	it("cancelCaretakerRequest should POST to cancel endpoint", async () => {
		(apiClient.post as Mock).mockResolvedValue(undefined);
		await cancelCaretakerRequest(10);
		expect(apiClient.post).toHaveBeenCalledWith(
			"caretakers/requests/10/cancel"
		);
	});

	it("getCaretakerCheck should GET from check endpoint", async () => {
		(apiClient.get as Mock).mockResolvedValue({ active_caretaker: null });
		const result = await getCaretakerCheck();
		expect(apiClient.get).toHaveBeenCalledWith("caretakers/check");
		expect(result).toEqual({ active_caretaker: null });
	});

	it("getPendingCaretakerRequests should GET requests for user", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getPendingCaretakerRequests(42);
		expect(apiClient.get).toHaveBeenCalledWith(
			"caretakers/requests?user_id=42"
		);
	});
});
