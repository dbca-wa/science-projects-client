const hasMeaningfulContent = (
  description: string | null | undefined,
): boolean => {
  if (!description) return false; // Return false if description is null or undefined.

  // Create a temporary DOM element to parse the HTML string.
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = description;

  // Extract the text content and trim it to remove whitespace.
  const textContent = tempDiv.textContent?.trim() || "";

  // Return true if there is any non-empty text content.
  return textContent.length > 0;
};

export default hasMeaningfulContent;
