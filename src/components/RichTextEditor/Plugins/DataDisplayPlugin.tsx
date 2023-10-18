import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html"
import { $getRoot, $getSelection, RangeSelection } from "lexical";


interface DataDisplayProps {
    // data?: string;
    setDisplayData: React.Dispatch<React.SetStateAction<string>>;
}

export const DataDisplayPlugin = ({ setDisplayData }: DataDisplayProps) => {
    const [editor, editorState] = useLexicalComposerContext();
    // setDisplayData();
    // const checkIfEmpty = () => {
    //     const root = $getRoot();
    //     const isEmpty = root.getFirstChild().isEmpty() && root.getChildrenSize() === 1;
    //     console.log("Is Empty: ", isEmpty);
    //     return isEmpty
    // };


    useEffect(() => {
        // if ($getRoot().isEmpty)

        editor.update(() => {
            const newHtml = $generateHtmlFromNodes(editor, null)

            console.log("DATA DISPLAY PLUGIN:", newHtml);
            setDisplayData(newHtml);
        })
    }, [editorState]);
    return null;
}


// if (data !== null && data !== undefined) {
//     const empty = checkIfEmpty()
//     console.log(empty)

//     // Create a DOMParser
//     if (empty === true) {
//         const htmlString = data;
//         const parser = new DOMParser();
//         const dom = parser.parseFromString(htmlString, 'text/html'
//             // textHtmlMimeType
//         );

//         const nodes = $generateNodesFromDOM(editor, dom);

//         $getRoot().select();
//         const selection = $getSelection() as RangeSelection;
//         selection.insertNodes(nodes);
//         // $insertNodes(nodes);

//     }

// }
