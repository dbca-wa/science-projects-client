import { describe, it, expect } from "vitest";
import { parseKeywords, mergeKeywords } from "@/shared/utils/keyword.utils";

describe("parseKeywords", () => {
	it("should split input on semicolons", () => {
		expect(parseKeywords("fauna;flora;ecology")).toEqual([
			"fauna",
			"flora",
			"ecology",
		]);
	});

	it("should trim whitespace from each segment", () => {
		expect(parseKeywords("  fauna ; flora  ;  ecology  ")).toEqual([
			"fauna",
			"flora",
			"ecology",
		]);
	});

	it("should filter out empty segments", () => {
		expect(parseKeywords("fauna;;flora;;;ecology")).toEqual([
			"fauna",
			"flora",
			"ecology",
		]);
	});

	it("should return a single keyword when no semicolons are present", () => {
		expect(parseKeywords("biodiversity")).toEqual(["biodiversity"]);
	});

	it("should return an empty array for an empty string", () => {
		expect(parseKeywords("")).toEqual([]);
	});

	it("should return an empty array for whitespace-only input", () => {
		expect(parseKeywords("   ")).toEqual([]);
	});

	it("should return an empty array for semicolons-only input", () => {
		expect(parseKeywords(";;;")).toEqual([]);
	});

	it("should handle trailing semicolons", () => {
		expect(parseKeywords("fauna;flora;")).toEqual(["fauna", "flora"]);
	});

	it("should handle leading semicolons", () => {
		expect(parseKeywords(";fauna;flora")).toEqual(["fauna", "flora"]);
	});

	it("should preserve keywords with internal spaces", () => {
		expect(parseKeywords("marine biology;coral reef")).toEqual([
			"marine biology",
			"coral reef",
		]);
	});
});

describe("mergeKeywords", () => {
	it("should merge new keywords into an existing list", () => {
		expect(mergeKeywords(["fauna"], ["flora", "ecology"])).toEqual([
			"fauna",
			"flora",
			"ecology",
		]);
	});

	it("should skip duplicates from the incoming list", () => {
		expect(mergeKeywords(["fauna", "flora"], ["flora", "ecology"])).toEqual([
			"fauna",
			"flora",
			"ecology",
		]);
	});

	it("should return the original list when all incoming keywords are duplicates", () => {
		const existing = ["fauna", "flora"];
		expect(mergeKeywords(existing, ["fauna", "flora"])).toEqual([
			"fauna",
			"flora",
		]);
	});

	it("should handle an empty existing list", () => {
		expect(mergeKeywords([], ["fauna", "flora"])).toEqual(["fauna", "flora"]);
	});

	it("should handle an empty incoming list", () => {
		expect(mergeKeywords(["fauna", "flora"], [])).toEqual(["fauna", "flora"]);
	});

	it("should handle both lists empty", () => {
		expect(mergeKeywords([], [])).toEqual([]);
	});

	it("should not modify the original existing array", () => {
		const existing = ["fauna"];
		mergeKeywords(existing, ["flora"]);
		expect(existing).toEqual(["fauna"]);
	});

	it("should preserve order — existing first, then new", () => {
		expect(mergeKeywords(["c", "a"], ["b", "d"])).toEqual(["c", "a", "b", "d"]);
	});

	it("should treat keywords as case-sensitive", () => {
		expect(mergeKeywords(["Fauna"], ["fauna"])).toEqual(["Fauna", "fauna"]);
	});
});
