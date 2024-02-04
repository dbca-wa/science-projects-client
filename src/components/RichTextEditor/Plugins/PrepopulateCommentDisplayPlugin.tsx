import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { $generateNodesFromDOM } from "@lexical/html";
// import { $generateNodesFromDOM, $getRoot, $getList, ListItemNode, ListNode } from "@lexical/html";
import { $getRoot } from "lexical";
interface HTMLPrepopulationProp {
  data: string;
  setPopulationInProgress?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PrepopulateCommentDisplayPlugin = ({
  data, setPopulationInProgress
}: HTMLPrepopulationProp) => {
  const checkIsHtml = (data: string) => {
    // Regular expression to check for HTML tags
    const htmlRegex = /<\/?[a-z][\s\S]*>/i;

    // Check if the string contains any HTML tags
    return htmlRegex.test(data);
  };

  const [fixedText, setFixedText] = useState(data);
  const isHtml = checkIsHtml(data);
  useEffect(() => {
    // console.log("IS Html:", isHtml);
    if (!isHtml) {
      if (data === "") {
        setFixedText(
          `<p class="editor-p-light" dir="ltr"><span style="white-space: pre-wrap;"></span></p>`
        );
      } else {
        setFixedText(
          `<p class="editor-p-light" dir="ltr"><span style="white-space: pre-wrap;">${data}</span></p>`
        );

      }

    }
  }, [isHtml]);

  const generateHtmlTable = (tableData: string[][]) => {
    const tableRows = tableData
      .map(
        (row, rowIndex) =>
          `<tr>${row
            .map(
              (cell, colIndex) =>
                `<${rowIndex === 0 || colIndex === 0 ? "th" : "td"
                } class="table-cell-dark${rowIndex === 0 ? " table-cell-header-dark" : ""
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
    return text.replace(/&nbsp;/g, "");
  };

  const [editor] = useLexicalComposerContext();
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (hasRendered) {
      editor.update(() => {
        let replacedData = "";
        // Remove whitespace in html format
        replacedData = removeHTMLSpace(fixedText);
        // Replace strings representing tables with actual HTML tables
        replacedData = replacedData.replace(/\[\[.*?\]\]/g, (match) => {
          const tableData = JSON.parse(match);
          return generateHtmlTable(tableData);
        });

        // Parse the replaced data
        const parser = new DOMParser();
        const dom = parser.parseFromString(replacedData, "text/html");

        const removableNulls = Array.from(dom.querySelectorAll("span")).filter(
          (span) => {
            return span.textContent === "null";
          }
        );

        if (removableNulls.length > 0) {
          const domBreak = dom.createElement("br");
          removableNulls[0].replaceWith(domBreak);
        }

        const bunchOfNodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();

        bunchOfNodes.forEach((node) => {
          if (root) {
            const firstChild = root.getFirstChild();
            // Remove any empty paragraph node caused by the Lexical 0.12.3 update
            if (firstChild !== null) {
              // console.log("CHILD", firstChild.getTextContent());
              if (
                firstChild.getTextContent() === "" ||
                firstChild.getTextContent() === "null" ||
                firstChild.getTextContent() === undefined ||
                firstChild.getTextContent() === null
              ) {
                firstChild.remove();
              }
            }

            if (node !== null) {
              // console.log(node);
              if (node.__type === "text" && bunchOfNodes.length <= 1) {
                //
                // console.log("BUNCHONODES", bunchOfNodes);
              } else {
                root.append(node);
              }
            }
          }
        });
        root.selectEnd();
      });
      if (setPopulationInProgress) {
        setPopulationInProgress(false);
      }
    } else {
      setHasRendered(true);
    }
  }, [hasRendered]);
  return null;
};
