/**
 * Returns true when the Insert/Update button should be disabled.
 *
 * Disabled when the URL is empty/whitespace, or when there is no
 * existing text selection and the link-text field is also empty/whitespace.
 */
export function isInsertDisabled(
	url: string,
	linkText: string,
	hasSelection: boolean
): boolean {
	if (url.trim() === "") return true;
	if (!hasSelection && linkText.trim() === "") return true;
	return false;
}
