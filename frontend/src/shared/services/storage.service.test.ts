import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing
vi.mock("@/shared/services/logger.service", () => ({
	logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/config/storage.config", () => ({
	STORAGE_CONFIG: {
		STORAGE_TYPES: {
			LOCAL: { PREFIX: "spms_", MAX_SIZE: 5 * 1024 * 1024, ENCRYPTION: false },
			SESSION: { PREFIX: "spms_s_", ENCRYPTION: false },
		},
		SECURITY: { ENCRYPTION_KEY: null, ENCRYPT_SENSITIVE_DATA: false },
		CLEANUP: {
			ENABLED: false,
			INTERVAL: 60000,
			EXPIRED_CLEANUP: true,
			SIZE_LIMIT_CLEANUP: false,
		},
		MIGRATION: { CURRENT_VERSION: 1, AUTO_MIGRATE: false },
		KEYS: {
			THEME: "theme",
			ACCESS_TOKEN: "access_token",
			REFRESH_TOKEN: "refresh_token",
		},
		TTL: { THEME_SETTINGS: 0 },
	},
}));

import { storage } from "./storage.service";

describe("storage.service", () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});

	describe("localStorage operations", () => {
		it("should set and get items", () => {
			storage.setItem("test-key", { value: "hello" });
			const result = storage.getItem<{ value: string }>("test-key");
			expect(result).toEqual({ value: "hello" });
		});

		it("should return null for non-existent keys", () => {
			expect(storage.getItem("non-existent")).toBeNull();
		});

		it("should remove items", () => {
			storage.setItem("to-remove", "data");
			storage.removeItem("to-remove");
			expect(storage.getItem("to-remove")).toBeNull();
		});

		it("should handle string values", () => {
			storage.setItem("str", "hello world");
			expect(storage.getItem<string>("str")).toBe("hello world");
		});

		it("should handle number values", () => {
			storage.setItem("num", 42);
			expect(storage.getItem<number>("num")).toBe(42);
		});

		it("should handle complex objects", () => {
			const obj = { nested: { array: [1, 2, 3], flag: true } };
			storage.setItem("complex", obj);
			expect(storage.getItem("complex")).toEqual(obj);
		});
	});

	describe("sessionStorage operations", () => {
		it("should set and get session items", () => {
			storage.setSessionItem("session-key", { data: 42 });
			const result = storage.getSessionItem<{ data: number }>("session-key");
			expect(result).toEqual({ data: 42 });
		});

		it("should return null for non-existent session keys", () => {
			expect(storage.getSessionItem("missing")).toBeNull();
		});

		it("should remove session items", () => {
			storage.setSessionItem("to-remove", "data");
			storage.removeSessionItem("to-remove");
			expect(storage.getSessionItem("to-remove")).toBeNull();
		});
	});

	describe("theme operations", () => {
		it("should set and get theme", () => {
			storage.setTheme("dark");
			expect(storage.getTheme()).toBe("dark");
		});
	});

	describe("storage info", () => {
		it("should return storage info object", () => {
			const info = storage.getStorageInfo();
			expect(info).toHaveProperty("totalItems");
			expect(info).toHaveProperty("localStorageSize");
			expect(typeof info.totalItems).toBe("number");
		});
	});

	describe("clear", () => {
		it("should clear all stored items", () => {
			storage.setItem("key1", "val1");
			storage.setItem("key2", "val2");
			storage.clear();
			expect(storage.getItem("key1")).toBeNull();
			expect(storage.getItem("key2")).toBeNull();
		});
	});
});
