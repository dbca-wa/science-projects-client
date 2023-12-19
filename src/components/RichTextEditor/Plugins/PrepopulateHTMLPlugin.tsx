import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html"
// import { $generateNodesFromDOM, $getRoot, $getList, ListItemNode, ListNode } from "@lexical/html";
import { ListItemNode, ListNode } from "@lexical/list"
import { $getRoot, $getSelection, LexicalNode, RangeSelection, createCommand } from "lexical";
import { CLEAR_EDITOR_COMMAND, LexicalEditor } from "lexical"
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
                                `<${rowIndex === 0 || colIndex === 0 ? 'th' : 'td'} class="table-cell-dark${rowIndex === 0 ? ' table-cell-header-dark' : ''
                                }">${cell}</${rowIndex === 0 || colIndex === 0 ? 'th' : 'td'}>`
                        )
                        .join('')}</tr>`
            )
            .join('');

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


    const generateUnorderedListItems = (text: string) => {
        return `<li>${text}</li>`;
    };

    const handleUnorderedList = (listItems: string[]) => {
        const listItemsHtml = listItems.map(generateUnorderedListItems).join('');
        return `<ul>${listItemsHtml}</ul>`;
    };

    const handleListItems = (data: string) => {
        // Handle unordered lists
        let replacedData = '';
        replacedData = data.replace(/·(.*?)(?=\r\n|\n|$)/g, (match, p1) => {
            return generateUnorderedListItems(p1.trim());
        });

        return replacedData;
    };

    const [editor, editorState] = useLexicalComposerContext();
    useEffect(() => {
        editor.update(() => {
            // Replace strings representing tables with actual HTML tables
            let replacedData = data.replace(/\[\[.*?\]\]/g, (match) => {
                const tableData = JSON.parse(match);
                return generateHtmlTable(tableData);
            });

            // Handle unordered lists
            replacedData = replacedData.replace(/·(.*?)(?=\r\n|\n|$)/g, (match, p1) => {
                return handleUnorderedList(p1.trim().split('\n').filter(Boolean));
            });

            // Parse the replaced data
            const parser = new DOMParser();
            const dom = parser.parseFromString(replacedData, 'text/html');

            console.log(dom.body.children)
            const bunchOfNodes = $generateNodesFromDOM(editor, dom)
            const root = $getRoot();
            // let currentListNode: ListNode | null = null;
            // let currentListItemNode: ListItemNode | null = null;

            bunchOfNodes.forEach((node, index) => {
                if (root) {
                    const firstChild = root.getFirstChild()
                    // Remove any empty paragraph node caused by the Lexical 0.12.3 update
                    if (firstChild !== null) {
                        if (firstChild.getTextContent() === "" || firstChild.getTextContent() === undefined || firstChild.getTextContent() === null) {
                            firstChild.remove()
                        }
                    }

                    if (node !== null) {
                        // if (node.getType() === 'list') {
                        //     currentListNode = node as ListNode;
                        //     root.append(currentListNode);
                        // } else if (node.getType() === 'list-item') {
                        //     currentListItemNode = node as ListItemNode;
                        //     if (currentListNode !== null) {
                        //         currentListNode.append(currentListItemNode);
                        //     } else {
                        //         root.append(currentListItemNode);
                        //     }
                        // } else {
                        root.append(node)

                        // }

                    }

                }
            });
            root.selectEnd();
            // const finalNode = root.getLastChild();
            // if (finalNode) {
            //     finalNode.selectStart();
            // }
        })
    }, [])
    return null;
}

