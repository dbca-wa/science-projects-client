import { useColorMode } from "@chakra-ui/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html"
import { $getRoot, $getSelection, CLEAR_EDITOR_COMMAND, RangeSelection } from "lexical";

export const DarkModePlugin = () => {
    const { colorMode } = useColorMode();
    const [editor] = useLexicalComposerContext();


    useEffect(() => {
        console.log("Changed to", colorMode)



        editor.update(() => {
            console.log('Color Mode:', colorMode)
            const generated = $generateHtmlFromNodes(editor, null);
            console.log("Generated HTML from nodes:", generated)

            let newHTMLString = ''
            if (
                colorMode === "dark" && String(generated).includes('-light')
            ) {
                newHTMLString = generated.replace(/-light"/g, '-dark"');
            } else if
                (
                colorMode === "light" && String(generated).includes('-dark')
            ) {
                newHTMLString = generated.replace(/-dark"/g, '-light"');
            }
            else {
                console.log("neither condition met")
            }
            console.log("New HTML:", newHTMLString);
            editor.focus();

            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);

            const parser = new DOMParser();
            const dom = parser.parseFromString(newHTMLString, 'text/html');

            const nodes = $generateNodesFromDOM(editor, dom);

            $getRoot().select();
            const selection = $getSelection() as RangeSelection;
            selection.insertNodes(nodes);
        })
    }, [editor, colorMode]);
    return null;
}



