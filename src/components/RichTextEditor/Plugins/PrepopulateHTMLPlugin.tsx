import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html"
import { $getRoot, $getSelection, LexicalNode, RangeSelection, createCommand } from "lexical";
import { CLEAR_EDITOR_COMMAND, LexicalEditor } from "lexical"

interface HTMLPrepopulationProp {
    data: string;
}

export const PrepopulateHTMLPlugin = ({ data }: HTMLPrepopulationProp) => {
    const [editor, editorState] = useLexicalComposerContext();
    useEffect(() => {
        editor.update(() => {
            // editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
            const parser = new DOMParser();
            const dom = parser.parseFromString(data, 'text/html');
            console.log(dom.body.children)
            const bunchOfNodes = $generateNodesFromDOM(editor, dom)
            const root = $getRoot();
            bunchOfNodes.forEach((node, index) => {
                if (root) {
                    const firstChild = root.getFirstChild()
                    // Remove any empty paragraph node caused by the Lexical 0.12.3 update
                    if (firstChild.getTextContent() === "" || firstChild.getTextContent() === undefined || firstChild.getTextContent() === null) {
                        firstChild.remove()
                    }
                    // Ignore any empty nodes in the data, else append the node to the root.
                    if (node.getTextContent() === "" || node.getTextContent() === undefined || node.getTextContent() === null) {
                        console.log("NODE PROBLEM: ", node.getTextContent())
                    } else {
                        console.log("NODE FINE", node.getTextContent())
                        root.append(node)
                    }
                }
            });
            root.selectEnd();
        })
    }, [])
    return null;
}

