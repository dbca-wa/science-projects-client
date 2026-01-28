import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { 
	useDBCARegions, 
	useDBCADistricts, 
	useNRM, 
	useIBRA, 
	useIMCRA,
	useGeoJSONLayer,
	useAllGeoJSONLayers
} from "./useGeoJSONLayers";

// Mock the logger
vi.mock("@/shared/services/logger.service", () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock GeoJSON data
const mockGeoJSONData = {
	type: "FeatureCollection" as const,
	features: [
		{
			type: "Feature" as const,
			properties: { name: "Test Region" },
			geometry: {
				type: "Polygon" as const,
				coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
			},
		},
	],
};

// Test wrapper with QueryClient
function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
		},
	});

	const Wrapper = ({ children }: { children: React.ReactNode }) => {
		return React.createElement(QueryClientProvider, { client: queryClient }, children);
	};

	return Wrapper;
}

describe("useGeoJSONLayers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockGeoJSONData),
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("useDBCARegions", () => {
		it("should load DBCA Regions data successfully", async () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDBCARegions(), { wrapper });

			expect(result.current.isLoading).toBe(true);

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockGeoJSONData);
			expect(mockFetch).toHaveBeenCalledWith("/data/optimized/optimized_DBCA_REGION_DATA.geojson");
		});

		it("should handle fetch errors", async () => {
			mockFetch.mockRejectedValue(new Error("Network error"));

			const wrapper = createWrapper();
			const { result } = renderHook(() => useDBCARegions(), { wrapper });

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			}, { timeout: 2000 });

			expect(result.current.error).toBeInstanceOf(Error);
		});

		it("should handle HTTP errors", async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 404,
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useDBCARegions(), { wrapper });

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			}, { timeout: 2000 });

			expect(result.current.error).toBeInstanceOf(Error);
		});
	});

	describe("useDBCADistricts", () => {
		it("should load DBCA Districts data successfully", async () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDBCADistricts(), { wrapper });

			expect(result.current.isLoading).toBe(true);

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockGeoJSONData);
			expect(mockFetch).toHaveBeenCalledWith("/data/optimized/optimized_DBCA_DISTRICT_DATA.geojson");
		});
	});

	describe("useNRM", () => {
		it("should load NRM data successfully", async () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useNRM(), { wrapper });

			expect(result.current.isLoading).toBe(true);

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockGeoJSONData);
			expect(mockFetch).toHaveBeenCalledWith("/data/optimized/optimized_NRM_DATA.geojson");
		});
	});

	describe("useIBRA", () => {
		it("should load IBRA data successfully", async () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useIBRA(), { wrapper });

			expect(result.current.isLoading).toBe(true);

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockGeoJSONData);
			expect(mockFetch).toHaveBeenCalledWith("/data/optimized/optimized_IBRA_DATA.geojson");
		});
	});

	describe("useIMCRA", () => {
		it("should load IMCRA data successfully", async () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useIMCRA(), { wrapper });

			expect(result.current.isLoading).toBe(true);

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockGeoJSONData);
			expect(mockFetch).toHaveBeenCalledWith("/data/optimized/optimized_IMCRA_DATA.geojson");
		});
	});

	describe("useGeoJSONLayer", () => {
		it("should load specific layer by type", async () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useGeoJSONLayer("dbcaRegions"), { wrapper });

			expect(result.current.isLoading).toBe(true);

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockGeoJSONData);
			expect(mockFetch).toHaveBeenCalledWith("/data/optimized/optimized_DBCA_REGION_DATA.geojson");
		});
	});

	describe("useAllGeoJSONLayers", () => {
		it("should load all layers and provide combined state", async () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useAllGeoJSONLayers(), { wrapper });

			expect(result.current.isLoading).toBe(true);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Check individual query states
			expect(result.current.dbcaRegions.isSuccess).toBe(true);
			expect(result.current.dbcaDistricts.isSuccess).toBe(true);
			expect(result.current.nrm.isSuccess).toBe(true);
			expect(result.current.ibra.isSuccess).toBe(true);
			expect(result.current.imcra.isSuccess).toBe(true);

			// Check combined data
			expect(result.current.data).toEqual({
				dbcaRegions: mockGeoJSONData,
				dbcaDistricts: mockGeoJSONData,
				nrm: mockGeoJSONData,
				ibra: mockGeoJSONData,
				imcra: mockGeoJSONData,
			});

			// Verify all endpoints were called
			expect(mockFetch).toHaveBeenCalledTimes(5);
			expect(mockFetch).toHaveBeenCalledWith("/data/optimized/optimized_DBCA_REGION_DATA.geojson");
			expect(mockFetch).toHaveBeenCalledWith("/data/optimized/optimized_DBCA_DISTRICT_DATA.geojson");
			expect(mockFetch).toHaveBeenCalledWith("/data/optimized/optimized_NRM_DATA.geojson");
			expect(mockFetch).toHaveBeenCalledWith("/data/optimized/optimized_IBRA_DATA.geojson");
			expect(mockFetch).toHaveBeenCalledWith("/data/optimized/optimized_IMCRA_DATA.geojson");
		});

		it("should handle partial failures gracefully", async () => {
			// Mock one layer to fail
			mockFetch.mockImplementation((url) => {
				if (url.includes("DBCA_REGION")) {
					return Promise.reject(new Error("Failed to load DBCA Regions"));
				}
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockGeoJSONData),
				});
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useAllGeoJSONLayers(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			}, { timeout: 2000 });

			// Should have error state due to one failure
			expect(result.current.isError).toBe(true);
			expect(result.current.error).toBeInstanceOf(Error);

			// But other layers should still load
			expect(result.current.dbcaDistricts.isSuccess).toBe(true);
			expect(result.current.nrm.isSuccess).toBe(true);
			expect(result.current.ibra.isSuccess).toBe(true);
			expect(result.current.imcra.isSuccess).toBe(true);

			// Combined data should have null for failed layer
			expect(result.current.data.dbcaRegions).toBe(null);
			expect(result.current.data.dbcaDistricts).toEqual(mockGeoJSONData);
		});
	});

	describe("query configuration", () => {
		it("should use correct staleTime and gcTime", async () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDBCARegions(), { wrapper });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			// Data should be considered fresh for 30 minutes
			expect(result.current.isStale).toBe(false);
		});

		it("should use exponential backoff for retries", async () => {
			let callCount = 0;
			mockFetch.mockImplementation(() => {
				callCount++;
				if (callCount <= 2) {
					return Promise.reject(new Error("Network error"));
				}
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockGeoJSONData),
				});
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useDBCARegions(), { wrapper });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			}, { timeout: 5000 });

			// Should have retried 2 times before succeeding
			expect(callCount).toBe(3);
		});
	});
});