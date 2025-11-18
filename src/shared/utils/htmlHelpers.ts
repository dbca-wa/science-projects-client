/**
 * HTML utility functions for parsing and extracting content
 */

/**
 * Extracts plain text title from HTML content
 * Looks for common text tags (p, span, h1-h4) and returns their text content
 * Falls back to innerHTML if no tags found
 *
 * @param htmlContent - HTML string to extract title from
 * @returns Plain text title
 */
export const extractHTMLTitle = (htmlContent: string): string => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = htmlContent;
  const tag = wrapper.querySelector("p, span, h1, h2, h3, h4");
  if (tag) {
    return tag.textContent || "";
  } else {
    return wrapper.innerHTML;
  }
};

/**
 * Alias for extractHTMLTitle for backwards compatibility
 * @deprecated Use extractHTMLTitle instead
 */
export const returnHTMLTitle = extractHTMLTitle;

/**
 * Replaces 'dark' theme classes with 'light' theme classes in HTML string
 * Also adds left margin to list items for better formatting
 *
 * @param htmlString - HTML string with dark theme classes
 * @returns HTML string with light theme classes
 */
export const replaceDarkWithLight = (htmlString: string): string => {
  // Replace 'dark' with 'light' in class attributes
  const modifiedHTML = htmlString.replace(
    /class\s*=\s*["']([^"']*dark[^"']*)["']/gi,
    (match, group) => {
      return `class="${group.replace(/\bdark\b/g, "light")}"`;
    },
  );

  // Add margin-right: 4px to all <li> elements
  const finalHTML = modifiedHTML.replace(
    /<li/g,
    '<li style="margin-left: 36px;"',
  );

  return finalHTML;
};
