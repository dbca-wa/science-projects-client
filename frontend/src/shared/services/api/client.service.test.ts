import { describe, it, expect, beforeEach, vi } from "vitest";
import Cookie from "js-cookie";
import { ApiClientService } from "./client.service";
import { AUTH_COOKIES, getCsrfCookieName } from "@/shared/constants";

/**
 * API Client tests.
 *
 * These exercise the real ApiClientService by mocking axios so the actual
 * request/response interceptors and error-mapping logic run. The axios
 * instance is replaced with a stub whose interceptor registrations are
 * captured, letting us invoke the interceptor handlers directly.
 */

// Minimal shapes for the values the interceptors actually touch.
type RequestConfigLike = { headers: Record<string, string> };
type ResponseLike = { data: unknown; status?: number };
type AxiosErrorLike = {
	response?: { status: number; data?: unknown };
	request?: unknown;
	message?: string;
};

const { mockInstance, captured } = vi.hoisted(() => {
	const captured = {
		request: {
			fulfilled: undefined as unknown,
			rejected: undefined as unknown,
		},
		response: {
			fulfilled: undefined as unknown,
			rejected: undefined as unknown,
		},
	};

	const mockInstance = {
		interceptors: {
			request: {
				use: (fulfilled: unknown, rejected: unknown) => {
					captured.request.fulfilled = fulfilled;
					captured.request.rejected = rejected;
				},
			},
			response: {
				use: (fulfilled: unknown, rejected: unknown) => {
					captured.response.fulfilled = fulfilled;
					captured.response.rejected = rejected;
				},
			},
		},
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	};

	return { mockInstance, captured };
});

vi.mock("axios", () => ({
	default: {
		create: () => mockInstance,
	},
}));

vi.mock("js-cookie");
vi.mock("@/shared/services/logger.service");

// js-cookie is auto-mocked. Alias Cookie.get with a loose mock type so
// mockReturnValue accepts our values (its real typing is overloaded).
const mockCookieGet = Cookie.get as ReturnType<typeof vi.fn>;

// Typed accessors for the captured interceptor handlers.
const runRequest = (config: RequestConfigLike): RequestConfigLike =>
	(captured.request.fulfilled as (c: RequestConfigLike) => RequestConfigLike)(
		config
	);

const runRequestError = (error: unknown): Promise<unknown> =>
	(captured.request.rejected as (e: unknown) => Promise<unknown>)(error);

const runResponse = (response: ResponseLike): ResponseLike =>
	(captured.response.fulfilled as (r: ResponseLike) => ResponseLike)(response);

const runResponseError = (error: AxiosErrorLike): Promise<unknown> =>
	(captured.response.rejected as (e: AxiosErrorLike) => Promise<unknown>)(
		error
	);

describe("ApiClientService", () => {
	let client: ApiClientService;

	beforeEach(() => {
		vi.clearAllMocks();
		mockCookieGet.mockReturnValue(undefined);
		// Reconstructing re-registers the interceptors against this instance.
		client = new ApiClientService();
	});

	describe("request interceptor", () => {
		it("adds the X-CSRFToken header when the CSRF cookie exists", () => {
			mockCookieGet.mockReturnValue("csrf-token-123");

			const config = runRequest({ headers: {} });

			expect(config.headers["X-CSRFToken"]).toBe("csrf-token-123");
			expect(Cookie.get).toHaveBeenCalledWith(getCsrfCookieName());
		});

		it("clears stale cookies and sets no header when CSRF is missing", () => {
			mockCookieGet.mockReturnValue(undefined);

			const config = runRequest({ headers: {} });

			expect(config.headers["X-CSRFToken"]).toBeUndefined();
			expect(Cookie.remove).toHaveBeenCalledWith(AUTH_COOKIES.LEGACY_CSRF);
		});

		it("rejects with the original error from the request error handler", async () => {
			const error = new Error("request setup failed");
			await expect(runRequestError(error)).rejects.toBe(error);
		});
	});

	describe("response interceptor - success", () => {
		it("passes successful responses through unchanged", () => {
			const response = { data: { value: 1 }, status: 200 };
			expect(runResponse(response)).toBe(response);
		});
	});

	describe("response interceptor - authentication handling", () => {
		it("logs out on 401 and clears the cookies it can reach", async () => {
			const dispatchSpy = vi
				.spyOn(window, "dispatchEvent")
				.mockReturnValue(true);

			await expect(
				runResponseError({ response: { status: 401, data: {} } })
			).rejects.toMatchObject({ status: 401 });

			expect(Cookie.remove).toHaveBeenCalledWith(getCsrfCookieName());
			expect(Cookie.remove).toHaveBeenCalledWith(AUTH_COOKIES.LEGACY_CSRF);

			const event = dispatchSpy.mock.calls[0]?.[0] as CustomEvent;
			expect(event.type).toBe("auth:unauthorised");

			dispatchSpy.mockRestore();
		});

		it("calls a registered unauthorised handler on 401", async () => {
			const onUnauthorised = vi.fn();
			client.setUnauthorisedHandler(onUnauthorised);
			const dispatchSpy = vi
				.spyOn(window, "dispatchEvent")
				.mockReturnValue(true);

			await expect(
				runResponseError({ response: { status: 401 } })
			).rejects.toMatchObject({ status: 401 });

			expect(onUnauthorised).toHaveBeenCalledTimes(1);
			dispatchSpy.mockRestore();
		});

		it("logs out on 403 when the CSRF cookie is missing (session expired)", async () => {
			mockCookieGet.mockReturnValue(undefined);
			const dispatchSpy = vi
				.spyOn(window, "dispatchEvent")
				.mockReturnValue(true);

			await expect(
				runResponseError({
					response: { status: 403, data: { detail: "Forbidden" } },
				})
			).rejects.toMatchObject({ status: 403 });

			expect(Cookie.remove).toHaveBeenCalledWith(getCsrfCookieName());
			expect(Cookie.remove).toHaveBeenCalledWith(AUTH_COOKIES.LEGACY_CSRF);
			dispatchSpy.mockRestore();
		});

		it("does NOT log out on 403 when the CSRF cookie exists (permission denied)", async () => {
			mockCookieGet.mockReturnValue("csrf-token-123");
			const dispatchSpy = vi
				.spyOn(window, "dispatchEvent")
				.mockReturnValue(true);

			await expect(
				runResponseError({
					response: {
						status: 403,
						data: { detail: "You do not have permission." },
					},
				})
			).rejects.toMatchObject({
				status: 403,
				message: "You do not have permission.",
			});

			expect(Cookie.remove).not.toHaveBeenCalled();
			expect(dispatchSpy).not.toHaveBeenCalled();
			dispatchSpy.mockRestore();
		});

		it("does NOT log out on 500 server errors", async () => {
			const dispatchSpy = vi
				.spyOn(window, "dispatchEvent")
				.mockReturnValue(true);

			await expect(
				runResponseError({
					response: { status: 500, data: "<html>oops</html>" },
				})
			).rejects.toMatchObject({ status: 500 });

			expect(Cookie.remove).not.toHaveBeenCalled();
			expect(dispatchSpy).not.toHaveBeenCalled();
			dispatchSpy.mockRestore();
		});

		it("does NOT log out on network errors (no response)", async () => {
			const dispatchSpy = vi
				.spyOn(window, "dispatchEvent")
				.mockReturnValue(true);

			await expect(
				runResponseError({ request: {}, message: "Network Error" })
			).rejects.toMatchObject({ status: 0 });

			expect(Cookie.remove).not.toHaveBeenCalled();
			expect(dispatchSpy).not.toHaveBeenCalled();
			dispatchSpy.mockRestore();
		});
	});

	describe("error message formatting", () => {
		it("returns a generic message for 5xx errors", async () => {
			await expect(
				runResponseError({
					response: { status: 503, data: "<html>err</html>" },
				})
			).rejects.toMatchObject({
				status: 503,
				message: "A server error occurred. Please try again later.",
			});
		});

		it("uses the Django detail field", async () => {
			await expect(
				runResponseError({
					response: { status: 400, data: { detail: "Invalid request" } },
				})
			).rejects.toMatchObject({ status: 400, message: "Invalid request" });
		});

		it("uses the first non_field_errors entry", async () => {
			await expect(
				runResponseError({
					response: {
						status: 400,
						data: { non_field_errors: ["Bad combo", "Second"] },
					},
				})
			).rejects.toMatchObject({ status: 400, message: "Bad combo" });
		});

		it("maps Django field errors and surfaces the first one", async () => {
			await expect(
				runResponseError({
					response: {
						status: 400,
						data: { username: ["This field is required."] },
					},
				})
			).rejects.toMatchObject({
				status: 400,
				message: "username: This field is required.",
				fieldErrors: { username: ["This field is required."] },
			});
		});

		it("prefers a single error string over field mapping", async () => {
			await expect(
				runResponseError({
					response: { status: 400, data: { error: "Incorrect password" } },
				})
			).rejects.toMatchObject({ status: 400, message: "Incorrect password" });
		});

		it("uses short plain-string responses as the message", async () => {
			await expect(
				runResponseError({ response: { status: 400, data: "Something broke" } })
			).rejects.toMatchObject({ status: 400, message: "Something broke" });
		});

		it("ignores HTML string bodies and keeps the default message", async () => {
			await expect(
				runResponseError({
					response: { status: 400, data: "<!DOCTYPE html><html></html>" },
				})
			).rejects.toMatchObject({ status: 400, message: "An error occurred" });
		});

		it("falls back to a default message when there is no body", async () => {
			await expect(
				runResponseError({ response: { status: 400 } })
			).rejects.toMatchObject({ status: 400, message: "An error occurred" });
		});
	});

	describe("HTTP methods", () => {
		it("get returns response.data and forwards the config", async () => {
			const data = { id: 1 };
			mockInstance.get.mockResolvedValue({ data });

			const result = await client.get<typeof data>("users/1", {
				params: { expand: true },
			});

			expect(result).toEqual(data);
			expect(mockInstance.get).toHaveBeenCalledWith("users/1", {
				params: { expand: true },
			});
		});

		it("post returns response.data and forwards the body", async () => {
			const data = { ok: true };
			mockInstance.post.mockResolvedValue({ data });

			const result = await client.post<typeof data>("users/log-in", {
				username: "a",
			});

			expect(result).toEqual(data);
			expect(mockInstance.post).toHaveBeenCalledWith(
				"users/log-in",
				{ username: "a" },
				undefined
			);
		});

		it("put returns response.data", async () => {
			mockInstance.put.mockResolvedValue({ data: { updated: true } });
			const result = await client.put<{ updated: boolean }>("users/1", {});
			expect(result).toEqual({ updated: true });
		});

		it("patch returns response.data", async () => {
			mockInstance.patch.mockResolvedValue({ data: { patched: true } });
			const result = await client.patch<{ patched: boolean }>("users/1", {});
			expect(result).toEqual({ patched: true });
		});

		it("delete returns response.data", async () => {
			mockInstance.delete.mockResolvedValue({ data: { deleted: true } });
			const result = await client.delete<{ deleted: boolean }>("users/1");
			expect(result).toEqual({ deleted: true });
		});
	});

	describe("blob methods", () => {
		it("getBlob requests a blob response type", async () => {
			const blob = new Blob(["file"]);
			mockInstance.get.mockResolvedValue({ data: blob });

			const result = await client.getBlob("documents/1");

			expect(result).toBe(blob);
			expect(mockInstance.get).toHaveBeenCalledWith("documents/1", {
				responseType: "blob",
			});
		});

		it("postBlob requests a blob response type and forwards the body", async () => {
			const blob = new Blob(["pdf"]);
			mockInstance.post.mockResolvedValue({ data: blob });

			const result = await client.postBlob("documents/render", { id: 1 });

			expect(result).toBe(blob);
			expect(mockInstance.post).toHaveBeenCalledWith(
				"documents/render",
				{ id: 1 },
				{ responseType: "blob" }
			);
		});
	});

	describe("configuration", () => {
		it("exposes the raw axios instance", () => {
			expect(client.getRawClient()).toBe(mockInstance);
		});
	});
});
