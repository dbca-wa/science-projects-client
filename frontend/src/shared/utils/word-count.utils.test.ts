import { describe, it, expect } from "vitest";
import { countWords } from "./word-count.utils";

describe("countWords", () => {
	describe("Plain text", () => {
		it("should count words in plain text", () => {
			expect(countWords("Hello world")).toBe(2);
			expect(countWords("One")).toBe(1);
			expect(countWords("One two three four five")).toBe(5);
		});

		it("should handle empty strings", () => {
			expect(countWords("")).toBe(0);
			expect(countWords("   ")).toBe(0);
			expect(countWords("\n\t  ")).toBe(0);
		});

		it("should handle multiple spaces", () => {
			expect(countWords("Hello   world")).toBe(2);
			expect(countWords("One  two   three")).toBe(3);
			expect(countWords("  Leading and trailing  ")).toBe(3);
		});
	});

	describe("HTML content", () => {
		it("should strip HTML tags and count words", () => {
			expect(countWords("<p>Hello world</p>")).toBe(2);
			expect(countWords("<div><p>Hello</p><p>world</p></div>")).toBe(2);
			expect(countWords("<strong>Bold</strong> <em>italic</em>")).toBe(2);
		});

		it("should handle empty HTML", () => {
			expect(countWords("<p></p>")).toBe(0);
			expect(countWords("<div><p></p></div>")).toBe(0);
			expect(countWords("<p>   </p>")).toBe(0);
		});

		it("should handle complex HTML structures", () => {
			const html = `
        <div>
          <h2>Title</h2>
          <p>First paragraph with <strong>bold</strong> text.</p>
          <ul>
            <li>Item one</li>
            <li>Item two</li>
          </ul>
        </div>
      `;
			// Title + First + paragraph + with + bold + text + Item + one + Item + two = 10
			expect(countWords(html)).toBe(10);
		});

		it("should handle nested tags", () => {
			expect(countWords("<p><strong><em>Hello</em></strong> world</p>")).toBe(
				2
			);
			expect(
				countWords("<div><span><a href='#'>Link text</a></span></div>")
			).toBe(2);
		});
	});

	describe("HTML entities", () => {
		it("should decode common HTML entities", () => {
			expect(countWords("Hello&nbsp;world")).toBe(2);
			expect(countWords("Tom&amp;Jerry")).toBe(1); // Tom&Jerry is one word
			expect(countWords("&lt;tag&gt;")).toBe(1); // <tag> is one word
			expect(countWords("&quot;quoted&quot;")).toBe(1);
			expect(countWords("&#39;apostrophe&#39;")).toBe(1);
		});

		it("should handle multiple entities", () => {
			expect(countWords("Hello&nbsp;&nbsp;world")).toBe(2);
			expect(countWords("A&nbsp;B&nbsp;C")).toBe(3);
		});
	});

	describe("Edge cases", () => {
		it("should handle self-closing tags", () => {
			expect(countWords("Hello<br/>world")).toBe(2);
			expect(countWords("Line<br />break")).toBe(2);
		});

		it("should handle tags with attributes", () => {
			expect(countWords('<a href="https://example.com">Link text</a>')).toBe(2);
			expect(countWords('<p class="text-lg">Paragraph text</p>')).toBe(2);
			expect(countWords('<img src="image.jpg" alt="Alt text" />')).toBe(0); // Self-closing tags have no text content
		});

		it("should handle mixed content", () => {
			expect(countWords("Plain text <p>HTML text</p> more plain")).toBe(6);
		});

		it("should handle special characters", () => {
			expect(countWords("Hello, world!")).toBe(2);
			expect(countWords("One-two three")).toBe(2); // Hyphenated words count as one
			expect(countWords("Email: test@example.com")).toBe(2);
		});
	});

	describe("Real-world examples", () => {
		it("should count words in project description", () => {
			const description = `
        <p>This project aims to <strong>improve biodiversity</strong> in the northern region.</p>
        <p>Key objectives include:</p>
        <ul>
          <li>Survey native species</li>
          <li>Monitor habitat changes</li>
          <li>Implement conservation strategies</li>
        </ul>
      `;
			// This + project + aims + to + improve + biodiversity + in + the + northern + region +
			// Key + objectives + include + Survey + native + species + Monitor + habitat + changes +
			// Implement + conservation + strategies = 22
			expect(countWords(description)).toBe(22);
		});

		it("should count words in formatted text", () => {
			const formatted = `
        <h2>Background</h2>
        <p>The <em>Science Projects Management System</em> (SPMS) is a web application.</p>
      `;
			// Background + The + Science + Projects + Management + System + SPMS + is + a + web + application = 11
			expect(countWords(formatted)).toBe(11);
		});
	});
});
