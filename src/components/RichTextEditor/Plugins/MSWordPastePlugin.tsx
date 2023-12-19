import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html"
import { $getRoot, $getSelection, LexicalNode, RangeSelection, createCommand } from "lexical";
import { CLEAR_EDITOR_COMMAND, LexicalEditor } from "lexical"
import { useColorMode } from "@chakra-ui/react";


export const MSWordPastePlugin = () => {

    const { colorMode } = useColorMode();

    // Helper function for subfunctions. Used to remove whitespace between 
    // level symbols and actual content, as well as whitespace before level symbol.
    const stripWhiteSpaceBetweenSymbolAndContent = (text: string, levelSymbol: string) => {
        const strippedText = '';
        return strippedText;
    }

    const symbolConversionDict = {
        '·': '',
        'o': '',
        '§': '',
        '': '',
    }

    const generateUnorderedListItems = (text: string) => {
        const firstLevelLI = '·';
        const midLevelLI = 'o';
        const finalLevelLI = '§';

        const item = text;
        return item;
    }

    // Parse the text for numbers, abcs and roman numerals followed by a period and space
    // to convert into appropriate ordered list items.
    const generateOrderedListItems = (text: string) => {
        const firstLevelLI = ''; // 123s .
        const midLevelLI = ''; // abcs .
        const finalLevelLI = ''; // roman numerals .


        const item = text;
        return item;
    }

    // Remove the p tags that the list items are wrapped in
    const removeUnnecessaaryPTags = (text: string) => {
        // create a new string for holding the updated data

        // convert into html

        // search conversion for li wrapped in p tag

        // remove the opening and closing tags for the p tags, including classes
        // so that each li is not wrapped in a p tag

        // convert back into string

        // return that string

    }

    // So that the items can be grouped together in a list
    const wrapItemsInAppropriateList = (textWithListItems: string) => {
        const textWithListsWrappedInOLOrUl = '';
        return textWithListsWrappedInOLOrUl;
    }

    // Main function for conversion of pasted clipboard content.
    // calls the above functions to 
    const handlePasteContent = (pastedContent: string) => {
        const replacedCopyPasteContent = '';
        return replacedCopyPasteContent;
    };

    const [editor, editorState] = useLexicalComposerContext();
    useEffect(() => {
        editor.update(() => {
            // Replace string representations of li items with actual html lists and items

            const replacedCopyPasteContent = '';

            // Parse the replaced data
            const parser = new DOMParser();
            const dom = parser.parseFromString(replacedCopyPasteContent, 'text/html');
            console.log(dom.body.children)
            const bunchOfNodes = $generateNodesFromDOM(editor, dom)

            // Find where current selection is
            const root = $getRoot();

            // Insert nodes at location
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

