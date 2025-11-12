import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot } from "lexical";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

interface HTMLPrepopulationProp {
	displayData: string;
}
export const PrepopulateDisplayPlugin = ({
	displayData,
}: HTMLPrepopulationProp) => {
	const generateHtmlTable = (tableData: string[][]) => {
		const tableRows = tableData
			.map(
				(row, rowIndex) =>
					`<tr>${row
						.map(
							(cell, colIndex) =>
								`<${
									rowIndex === 0 || colIndex === 0
										? "th"
										: "td"
								} class="table-cell-dark${
									rowIndex === 0
										? " table-cell-header-dark"
										: ""
								}">${cell}</${rowIndex === 0 || colIndex === 0 ? "th" : "td"}>`
						)
						.join("")}</tr>`
			)
			.join("");

		return `<table class="table-dark">
              <colgroup>
                <col>
                <col>
                <col>
                <col>
                <col>
              </colgroup>
              <tbody>
                ${tableRows}
              </tbody>
            </table>`;
	};

	const removeHTMLSpace = (text: string) => {
		return text?.replace(/&nbsp;/g, " ");
	};

	// const removePreWrap = (text: string): string => {
	//   // Remove 'style="white-space: pre-wrap;"' from a span
	//   const regex =
	//     /<span[^>]*\sstyle\s*=\s*["'][^"']*white-space:\s*pre-wrap;[^"']*["'][^>]*>/g;
	//   return text.replace(regex, (match) =>
	//     match.replace(
	//       /style\s*=\s*["'][^"']*white-space:\s*pre-wrap;[^"']*["']\s*/g,
	//       ""
	//     )
	//   );
	// };

	const [editor] = useLexicalComposerContext();
	useEffect(() => {
		editor.update(() => {
			// let replacedData = displayData;
			let replacedData = "";
			replacedData = removeHTMLSpace(displayData);
			replacedData = replacedData?.replace(/\[\[.*?\]\]/g, (match) => {
				const tableData = JSON.parse(match);
				return generateHtmlTable(tableData);
			});
			// replacedData = removePreWrap(replacedData);
			// Parse the replaced data
			const parser = new DOMParser();
			const dom = parser.parseFromString(replacedData, "text/html");

			const bunchOfNodes = $generateNodesFromDOM(editor, dom);

			const root = $getRoot();
			// console.log(root);
			bunchOfNodes.forEach((node) => {
				if (root) {
					const firstChild = root.getFirstChild();
					// Remove any empty paragraph node caused by the Lexical 0.12.3 update
					if (firstChild !== null) {
						if (
							firstChild.getTextContent() === "" ||
							firstChild.getTextContent() === undefined ||
							firstChild.getTextContent() === null
						) {
							firstChild.remove();
						}
					}

					if (node !== null) {
						if (
							!(
								node.__type === "text" &&
								bunchOfNodes.length <= 1
							)
						) {
							// console.log("should be appended");
							root.append(node);
						} else {
							// console.log({
							// 	Type: node.__type,
							// 	"BoN Len": bunchOfNodes.length,
							// });
						}
					}
				}
			});
			root.selectEnd();
		});
	}, []);
	return null;
};
