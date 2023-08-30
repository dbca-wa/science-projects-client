// A button for highlighting font with a color in the rich text editor

import { Button } from "@chakra-ui/react"
import { FaCaretDown, FaHighlighter } from "react-icons/fa"
import { registerCodeHighlighting } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { BaseToolbarMenuButton } from "../Buttons/BaseToolbarMenuButton";

// Similar Dropdown button to FontColorPicker, but for background highlight of text

export const FontHighlighterButton = () => {
    // const [editor] = useLexicalComposerContext();

    // useEffect(() => {
    //     return registerCodeHighlighting(editor);
    // }, [editor])
    return (
        <BaseToolbarMenuButton
            menuIcon={FaHighlighter}
            menuItems={
                []
            }
        />
    )
}