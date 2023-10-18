import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html"
import { $getRoot, $getSelection, RangeSelection } from "lexical";

interface HTMLPrepopulationProp {
    data: string;
}

export const PrepopulateHTMLPlugin = ({ data }: HTMLPrepopulationProp) => {
    const [editor, editorState] = useLexicalComposerContext();

    const checkIfEmpty = () => {
        const root = $getRoot();
        const isEmpty = root.getFirstChild().isEmpty() && root.getChildrenSize() === 1;
        // console.log("Is Empty: ", isEmpty);
        return isEmpty
    };


    useEffect(() => {
        // if ($getRoot().isEmpty)

        editor.update(() => {

            if (data !== null && data !== undefined) {
                const empty = checkIfEmpty()
                // console.log(empty)

                // Create a DOMParser
                if (empty === true) {
                    const htmlString = data;
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(htmlString, 'text/html'
                        // textHtmlMimeType
                    );

                    const nodes = $generateNodesFromDOM(editor, dom);

                    $getRoot().select();
                    const selection = $getSelection() as RangeSelection;
                    selection.insertNodes(nodes);
                    // $insertNodes(nodes);

                }

            }
        })
    }, [editor]);
    return null;
}

