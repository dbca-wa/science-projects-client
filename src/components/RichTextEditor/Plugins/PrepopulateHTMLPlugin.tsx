import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
// import { $generateNodesFromDOM, $getRoot, $getList, ListItemNode, ListNode } from "@lexical/html";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  $getRoot,
  $getSelection,
  LexicalNode,
  RangeSelection,
  createCommand,
} from "lexical";
import { CLEAR_EDITOR_COMMAND, LexicalEditor } from "lexical";
import { useColorMode } from "@chakra-ui/react";
interface HTMLPrepopulationProp {
  data: string;
}

export const PrepopulateHTMLPlugin = ({ data }: HTMLPrepopulationProp) => {
  const { colorMode } = useColorMode();

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

  const [editor, editorState] = useLexicalComposerContext();
  useEffect(() => {
    editor.update(() => {
      let replacedData = "";
      // Remove whitespace in html format
      replacedData = removeHTMLSpace(data);
      // Replace ol symbols and sections with html ol lis
      // replacedData = handlePastedWordList(replacedData, colorMode);

      // Replace strings representing tables with actual HTML tables
      replacedData = replacedData.replace(/\[\[.*?\]\]/g, (match) => {
        const tableData = JSON.parse(match);
        return generateHtmlTable(tableData);
      });

      // Parse the replaced data
      const parser = new DOMParser();
      const dom = parser.parseFromString(replacedData, "text/html");

      const bunchOfNodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();

      bunchOfNodes.forEach((node, index) => {
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
            root.append(node);
          }
        }
      });
      root.selectEnd();
    });
  }, []);
  return null;
};
