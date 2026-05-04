import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	getCaretakerCheck,
	requestCaretaker,
	getPendingCaretakerRequests,
	getOutgoingCaretakerRequests,
	approveCaretakerRequest,
	rejectCaretakerRequest,
	cancelCaretakerRequest,
	deleteCaretaker,
} from "./caretaker.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

describe("caretaker.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getCaretakerCheck", () => {
		it("should GET caretaker status from check endpoint", async () => {
			const mockResponse = { active_caretaker: null, pending_request: null };
			(apiClient.get as Mock).mockResolvedValue(mockResponse);

			const result = await getCaretakerCheck();

			expect(apiClient.get).toHaveBeenCalledWith("caretakers/check");
			expect(result).toEqual(mockResponse);
		});
	});

	describe("requestCaretaker", () => {
		it("should POST caretaker request data", async () => {
			(apiClient.post as Mock).mockResolvedValue({ task_id: 10 });

			const result = await requestCaretaker({
				user_id: 1,
				caretaker_id: 2,
				reason: "leave",
				end_date: "2026-06-01",
			});

			expect(apiClient.post).toHaveBeenCalledWith(
				"caretakers/requests/create",
				expect.objectContaining({
					user_id: 1,
					caretaker_id: 2,
					reason: "leave",
					end_date: "2026-06-01",
				})
			);
			expect(result).toEqual({ task_id: 10 });
		});
	});

	describe("getPendingCaretakerRequests", () => {
		it("should GET pending requests for a user", async () => {
			const mockTasks = [{ id: 1, status: "pending" }];
			(apiClient.get as Mock).mockResolvedValue(mockTasks);

			const result = await getPendingCaretakerRequests(42);

			expect(apiClient.get).toHaveBeenCalledWith(
				"caretakers/requests?user_id=42"
			);
			expect(result).toEqual(mockTasks);
		});
	});

	describe("getOutgoingCaretakerRequests", () => {
		it("should GET outgoing requests for a user", async () => {
			const mockTasks = [{ id: 2, status: "pending" }];
			(apiClient.get as Mock).mockResolvedValue(mockTasks);

			const result = await getOutgoingCaretakerRequests(42);

			expect(apiClient.get).toHaveBeenCalledWith(
				"caretakers/requests/outgoing?user_id=42"
			);
			expect(result).toEqual(mockTasks);
		});
	});

	describe("approveCaretakerRequest", () => {
		it("should POST to approve endpoint", async () => {
			const mockCaretaker = { id: 1 };
			(apiClient.post as Mock).mockResolvedValue(mockCaretaker);

			const result = await approveCaretakerRequest(10);

			expect(apiClient.post).toHaveBeenCalledWith(
				"caretakers/requests/10/approve"
			);
			expect(result).toEqual(mockCaretaker);
		});
	});

	describe("rejectCaretakerRequest", () => {
		it("should POST to reject endpoint", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);

			await rejectCaretakerRequest(10);

			expect(apiClient.post).toHaveBeenCalledWith(
				"caretakers/requests/10/reject"
			);
		});
	});

	describe("cancelCaretakerRequest", () => {
		it("should POST to cancel endpoint", async () => {
			(apiClient.post as Mock).mockResolvedValue(undefined);

			await cancelCaretakerRequest(10);

			expect(apiClient.post).toHaveBeenCalledWith(
				"caretakers/requests/10/cancel"
			);
		});
	});

	describe("deleteCaretaker", () => {
		it("should DELETE caretaker by ID", async () => {
			(apiClient.delete as Mock).mockResolvedValue(undefined);

			await deleteCaretaker(5);

			expect(apiClient.delete).toHaveBeenCalledWith("caretakers/5");
		});
	});
});
