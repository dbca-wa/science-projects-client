import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useEffect } from "react";
interface HTMLPrepopulationProp {
  data: string;
}

export const PrepopulateHTMLPlugin = ({ data }: HTMLPrepopulationProp) => {
  const generateHtmlTable = (tableData: string[][]) => {
    const tableRows = tableData
      .map(
        (row, rowIndex) =>
          `<tr>${row
            .map(
              (cell, colIndex) =>
                `<${
                  rowIndex === 0 || colIndex === 0 ? "th" : "td"
                } class="table-cell-dark${
                  rowIndex === 0 ? " table-cell-header-dark" : ""
                }">${cell}</${rowIndex === 0 || colIndex === 0 ? "th" : "td"}>`,
            )
            .join("")}</tr>`,
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
      let replacedData = "";
      replacedData = removeHTMLSpace(data);
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
            if (!(node.__type === "text" && bunchOfNodes.length <= 1)) {
              root.append(node);
            }
          }
        }
      });
      root.selectEnd();
    });
  }, []);
  return null;
};
