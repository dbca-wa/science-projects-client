import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { $createParagraphNode, $getRoot } from "lexical";

interface HTMLPrepopulationProp {
  data: string;
  setPopulationInProgress?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PrepopulateCommentDisplayPlugin = ({
  data,
  setPopulationInProgress,
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
    if (!isHtml) {
      if (data === "") {
        setFixedText(
          `<p class="editor-p-light" dir="ltr"><span style="white-space: pre-wrap;"></span></p>`,
        );
      } else {
        setFixedText(
          `<p class="editor-p-light" dir="ltr"><span style="white-space: pre-wrap;">${data}</span></p>`,
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
    return text.replace(/&nbsp;/g, " ");
  };

  const processMentions = (dom: Document) => {
    // Find spans with mention data attributes
    const mentionSpans = dom.querySelectorAll("span[data-user-id]");

    mentionSpans.forEach((span) => {
      // Cast the Element to HTMLElement to access style property
      const htmlSpan = span as HTMLElement;

      // Ensure the class is set
      htmlSpan.className = "mention";

      // Apply styling directly to ensure it renders properly
      htmlSpan.style.backgroundColor = "rgba(24, 119, 232, 0.2)";
      htmlSpan.style.paddingLeft = "5px";
      htmlSpan.style.paddingRight = "5px";
      htmlSpan.style.borderRadius = "5px";
      htmlSpan.style.color = "#1877e8";
      htmlSpan.style.fontWeight = "500";

      // Ensure the @ symbol is present at the beginning
      if (htmlSpan.textContent && !htmlSpan.textContent.startsWith("@")) {
        htmlSpan.textContent = `@${htmlSpan.textContent}`;
      }
    });

    return dom;
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

        // Process mentions to ensure styling is preserved
        processMentions(dom);

        const removableNulls = Array.from(dom.querySelectorAll("span")).filter(
          (span) => {
            return span.textContent === "null";
          },
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
              if (node.__type === "text" && bunchOfNodes.length <= 1) {
                // Handle text nodes
              } else {
                try {
                  root.append(node);
                } catch (e) {
                  console.log(e);
                  console.log(node);
                  const paragraphNode = $createParagraphNode();
                  paragraphNode.append(node);
                  root.append(paragraphNode);
                }
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
