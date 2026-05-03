/**
 * Tests for HTML normalisation utility
 *
 * Verifies that normaliseHtmlContent handles Lexical editor serialisation
 * differences so that content loaded from the database compares equal to
 * the same content after Lexical re-serialises it.
 */

import { describe, it, expect } from "vitest";
import { normaliseHtmlContent } from "./html-normalise.utils";

describe("normaliseHtmlContent", () => {
	it("returns empty string for falsy input", () => {
		expect(normaliseHtmlContent("")).toBe("");
		expect(normaliseHtmlContent(null as unknown as string)).toBe("");
		expect(normaliseHtmlContent(undefined as unknown as string)).toBe("");
	});

	it("trims whitespace", () => {
		expect(normaliseHtmlContent("  <p>Hello</p>  ")).toBe("<p>Hello</p>");
	});

	it("removes whitespace between tags", () => {
		expect(normaliseHtmlContent("<p>Hello</p>  <p>World</p>")).toBe(
			"<p>Hello</p><p>World</p>"
		);
	});

	it("removes empty paragraphs without content", () => {
		expect(normaliseHtmlContent("<p></p>")).toBe("");
		expect(normaliseHtmlContent("<p>  </p>")).toBe("");
	});

	it("removes empty paragraphs with <br> (Lexical pattern)", () => {
		expect(normaliseHtmlContent("<p><br></p>")).toBe("");
		expect(normaliseHtmlContent("<p><br/></p>")).toBe("");
		expect(normaliseHtmlContent("<p><br /></p>")).toBe("");
	});

	it("removes empty paragraphs with attributes", () => {
		expect(normaliseHtmlContent('<p class="editor-paragraph"><br></p>')).toBe(
			""
		);
		expect(normaliseHtmlContent('<p class="editor-paragraph"></p>')).toBe("");
	});

	it("normalises self-closing tags", () => {
		expect(normaliseHtmlContent("<br/>")).toBe("<br>");
		expect(normaliseHtmlContent("<br />")).toBe("<br>");
		expect(normaliseHtmlContent('<img src="test.jpg"/>')).toBe(
			'<img src="test.jpg">'
		);
	});

	it("sorts class attributes alphabetically", () => {
		expect(normaliseHtmlContent('<p class="b a c">text</p>')).toBe(
			'<p class="a b c">text</p>'
		);
	});

	it("removes data-lexical attributes", () => {
		expect(normaliseHtmlContent('<p data-lexical-text="true">Hello</p>')).toBe(
			"<p>Hello</p>"
		);
	});

	it("removes trailing <br> inside paragraphs", () => {
		expect(normaliseHtmlContent("<p>Hello<br></p>")).toBe("<p>Hello</p>");
	});

	it("treats identical content as equal after normalisation", () => {
		const stored = '<p class="editor-paragraph">Hello world</p>';
		const lexicalOutput =
			'<p class="editor-paragraph" data-lexical-text="true">Hello world</p>';
		expect(normaliseHtmlContent(stored)).toBe(
			normaliseHtmlContent(lexicalOutput)
		);
	});

	it("treats content with different empty paragraph styles as equal", () => {
		const stored = "<p>Hello</p><p></p>";
		const lexicalOutput = "<p>Hello</p><p><br></p>";
		expect(normaliseHtmlContent(stored)).toBe(
			normaliseHtmlContent(lexicalOutput)
		);
	});

	it("detects actual content changes", () => {
		const original = "<p>Hello world</p>";
		const changed = "<p>Hello changed world</p>";
		expect(normaliseHtmlContent(original)).not.toBe(
			normaliseHtmlContent(changed)
		);
	});

	it("detects added paragraphs", () => {
		const original = "<p>Hello</p>";
		const changed = "<p>Hello</p><p>New paragraph</p>";
		expect(normaliseHtmlContent(original)).not.toBe(
			normaliseHtmlContent(changed)
		);
	});
});
