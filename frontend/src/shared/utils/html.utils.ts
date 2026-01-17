/**
 * Sanitize HTML string by removing inline styles but preserving link colors
 * Used for displaying rich text editor content safely
 * 
 * @param htmlString - Raw HTML string from rich text editor
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (htmlString: string): string => {
  if (!htmlString) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const elements = doc.body.querySelectorAll("*");

  elements.forEach((element) => {
    // Unwrap bold and strong tags (remove tag but keep content)
    if (
      element.tagName.toLowerCase() === "b" ||
      element.tagName.toLowerCase() === "strong"
    ) {
      const parent = element.parentNode;
      while (element.firstChild) {
        parent?.insertBefore(element.firstChild, element);
      }
      parent?.removeChild(element);
    } else if (element.tagName.toLowerCase() === "a") {
      // Preserve links but add styling classes
      element.removeAttribute("style");
      element.setAttribute("class", "text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300");
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    } else {
      // Remove inline styles from other elements
      element.removeAttribute("style");
    }
  });

  return doc.body.innerHTML;
};

/**
 * Check if rich text editor content is empty
 * Handles various empty states from rich text editors
 * 
 * @param content - HTML content string
 * @returns True if content is empty or contains only empty paragraphs
 */
export const isEmptyRichTextContent = (content: string | undefined): boolean => {
  if (!content) return true;

  const emptyPatterns = [
    "",
    "<p></p>",
    '<p class="editor-p-light"><br></p>',
    '<p class="editor-p-dark"><br></p>',
  ];

  return emptyPatterns.includes(content);
};

/**
 * Get sanitized HTML with fallback for empty content
 * 
 * @param content - HTML content string
 * @param fallback - Fallback text to display when content is empty
 * @returns Sanitized HTML or fallback message
 */
export const getSanitizedHtmlOrFallback = (
  content: string | undefined,
  fallback: string = "(Not Provided)"
): string => {
  if (isEmptyRichTextContent(content)) {
    return `<p>${fallback}</p>`;
  }
  return sanitizeHtml(content || `<p>${fallback}</p>`);
};
