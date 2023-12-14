import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html"
import { $getRoot, $getSelection, LexicalNode, RangeSelection, createCommand } from "lexical";
import { CLEAR_EDITOR_COMMAND, LexicalEditor } from "lexical"

interface HTMLPrepopulationProp {
    data: string;
}

export const PrepopulateHTMLPlugin = ({ data }: HTMLPrepopulationProp) => {
    const generateHtmlTable = (tableData: string[][]) => {
        const tableRows = tableData
            .map(
                (row) =>
                    `<tr>${row
                        .map((cell) => `<td>${cell}</td>`)
                        .join('')}</tr>`
            )
            .join('');
        return `<table>${tableRows}</table>`;
    };

    const [editor, editorState] = useLexicalComposerContext();
    useEffect(() => {
        editor.update(() => {
            // Replace strings representing tables with actual HTML tables
            const replacedData = data.replace(/\[\[.*?\]\]/g, (match) => {
                const tableData = JSON.parse(match);
                return generateHtmlTable(tableData);
            });

            // Parse the replaced data
            const parser = new DOMParser();
            const dom = parser.parseFromString(replacedData, 'text/html');


            // // editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
            // // [["Role", "Year 1", "Year 2", "Year 3"], ["Scientist", "", "", ""], ["Technical", "", "", ""], ["Volunteer", "", "", ""], ["Collaborator", "", "", ""]]
            // // [["Source", "Year 1", "Year 2", "Year 3"], ["Consolidated Funds (DBCA)", "", "", ""], ["External Funding", "", "", ""]]



            // const parser = new DOMParser();
            // const dom = parser.parseFromString(data, 'text/html');

            console.log(dom.body.children)
            const bunchOfNodes = $generateNodesFromDOM(editor, dom)
            const root = $getRoot();
            bunchOfNodes.forEach((node, index) => {
                if (root) {
                    const firstChild = root.getFirstChild()
                    // Remove any empty paragraph node caused by the Lexical 0.12.3 update
                    if (firstChild !== null) {
                        if (firstChild.getTextContent() === "" || firstChild.getTextContent() === undefined || firstChild.getTextContent() === null) {
                            firstChild.remove()
                        }
                    }

                    // Ignore any empty nodes in the data, else append the node to the root.
                    // Turned off for now, due to line breaks required after tables
                    if (node !== null) {
                        // if (node.getTextContent() === "" || node.getTextContent() === undefined || node.getTextContent() === null) {
                        //     console.log("NODE PROBLEM: ", node.getTextContent())
                        // } 
                        // else {
                        // console.log("NODE FINE", node.getTextContent())
                        root.append(node)
                        // }
                    }

                }
            });
            root.selectEnd();
        })
    }, [])
    return null;
}

