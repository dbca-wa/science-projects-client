declare module "htmldiff-js" {
	interface HtmlDiff {
		execute(oldHtml: string, newHtml: string): string;
	}

	const HtmlDiff: HtmlDiff;
	export default HtmlDiff;
}
