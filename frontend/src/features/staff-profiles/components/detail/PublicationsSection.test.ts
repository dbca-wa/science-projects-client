import { describe, it, expect } from "vitest";
import {
	stripHtml,
	getAuthorKey,
	comparePublications,
} from "./PublicationsSection";
import type { ILibraryPublication } from "../../types/staff-profile.types";

const makePub = (
	overrides: Partial<ILibraryPublication> = {}
): ILibraryPublication => ({
	title: "Default Title",
	year: "2024",
	BiblioText: "<b>Author, A.</b> (2024) Default Title.",
	...overrides,
});

describe("stripHtml", () => {
	it("removes simple HTML tags", () => {
		expect(stripHtml("<b>Hello</b> <i>world</i>")).toBe("Hello world");
	});

	it("collapses multiple whitespace into single spaces", () => {
		expect(stripHtml("Hello   world\n\tfoo")).toBe("Hello world foo");
	});

	it("extracts text from nested markup", () => {
		expect(stripHtml("<div><span>Author</span>, <i>A.</i></div>")).toBe(
			"Author, A."
		);
	});

	it("treats an unclosed angle bracket as literal text", () => {
		expect(stripHtml("<b>Author<")).toBe("Author<");
	});

	it("returns empty string for tags-only input", () => {
		expect(stripHtml("<div><span></span></div>")).toBe("");
	});

	it("handles empty string input", () => {
		expect(stripHtml("")).toBe("");
	});

	it("returns plain text unchanged", () => {
		expect(stripHtml("No tags here")).toBe("No tags here");
	});
});

describe("getAuthorKey", () => {
	it("extracts text before the year marker", () => {
		const pub = makePub({
			BiblioText: "<b>Smith, J.</b> and Brown, K. (2023) Some Title.",
		});
		expect(getAuthorKey(pub)).toBe("Smith, J. and Brown, K.");
	});

	it("handles year with letter suffix like (2023a)", () => {
		const pub = makePub({
			BiblioText: "Jones, A. (2023a) Paper Title.",
		});
		expect(getAuthorKey(pub)).toBe("Jones, A.");
	});

	it("returns full text when no year marker is found", () => {
		const pub = makePub({
			BiblioText: "Author without year marker",
		});
		expect(getAuthorKey(pub)).toBe("Author without year marker");
	});

	it("handles null BiblioText gracefully", () => {
		const pub = makePub({ BiblioText: null as unknown as string });
		expect(getAuthorKey(pub)).toBe("");
	});

	it("strips HTML and decodes entities before extracting the author key", () => {
		const pub = makePub({
			BiblioText: "<b>Adams, B.</b> &amp; <i>Clark, D.</i> (2020) Title.",
		});
		expect(getAuthorKey(pub)).toBe("Adams, B. & Clark, D.");
	});
});

describe("comparePublications", () => {
	it("sorts alphabetically by author text", () => {
		const pubA = makePub({
			BiblioText: "Adams, A. (2024) Paper A.",
			title: "Paper A",
		});
		const pubB = makePub({
			BiblioText: "Brown, B. (2024) Paper B.",
			title: "Paper B",
		});
		expect(comparePublications(pubA, pubB)).toBeLessThan(0);
		expect(comparePublications(pubB, pubA)).toBeGreaterThan(0);
	});

	it("is case-insensitive for author comparison", () => {
		const pubLower = makePub({
			BiblioText: "adams, A. (2024) Paper A.",
			title: "Paper A",
		});
		const pubUpper = makePub({
			BiblioText: "Adams, A. (2024) Paper A.",
			title: "Paper A",
		});
		expect(comparePublications(pubLower, pubUpper)).toBe(0);
	});

	it("falls back to title when authors are identical", () => {
		const pubX = makePub({
			BiblioText: "Smith, J. (2024) Alpha Paper.",
			title: "Alpha Paper",
		});
		const pubY = makePub({
			BiblioText: "Smith, J. (2024) Beta Paper.",
			title: "Beta Paper",
		});
		expect(comparePublications(pubX, pubY)).toBeLessThan(0);
		expect(comparePublications(pubY, pubX)).toBeGreaterThan(0);
	});

	it("returns 0 for identical entries", () => {
		const pub = makePub({
			BiblioText: "Same, S. (2024) Same Title.",
			title: "Same Title",
		});
		expect(comparePublications(pub, pub)).toBe(0);
	});

	it("handles numeric ordering in author text", () => {
		const pub2 = makePub({
			BiblioText: "Author 2 (2024) Title.",
			title: "Title",
		});
		const pub10 = makePub({
			BiblioText: "Author 10 (2024) Title.",
			title: "Title",
		});
		// With numeric: true, "Author 2" should come before "Author 10"
		expect(comparePublications(pub2, pub10)).toBeLessThan(0);
	});

	it("sorts a list of publications correctly", () => {
		const pubs = [
			makePub({ BiblioText: "Zeta, Z. (2024) Title C.", title: "Title C" }),
			makePub({ BiblioText: "Alpha, A. (2024) Title B.", title: "Title B" }),
			makePub({ BiblioText: "Alpha, A. (2024) Title A.", title: "Title A" }),
			makePub({ BiblioText: "Milo, M. (2024) Title D.", title: "Title D" }),
		];

		const sorted = [...pubs].sort(comparePublications);

		expect(sorted[0].title).toBe("Title A");
		expect(sorted[1].title).toBe("Title B");
		expect(sorted[2].title).toBe("Title D");
		expect(sorted[3].title).toBe("Title C");
	});
});
