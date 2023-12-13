// Section containing the core font formatting buttons

import { Flex } from "@chakra-ui/react"
import { BoldButton } from "../Buttons/BoldButton"
import { ItalicsButton } from "../Buttons/ItalicsButton"
import { UnderlineButton } from "../Buttons/UnderlineButton"
import { FontColorPickerButton } from "../MenuButtons/FontColorPickerButton"
import { FontHighlighterButton } from "../MenuButtons/FontHighlighterButton"
import { useToolbarClickListener } from "../../../lib/hooks/useToolbarClickListener"
import { RefObject } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"


interface Props {
    editorRef: RefObject<HTMLTextAreaElement>;
}

export const FontFormattingButtons = ({ editorRef }: Props) => {

    const { onClick } = useToolbarClickListener({ editorRef: editorRef });
    const [editor] = useLexicalComposerContext();


    return (
        <Flex
        // flexGrow={1}
        >
            <BoldButton onClick={onClick} editor={editor} />
            <ItalicsButton onClick={onClick} editor={editor} />
            <UnderlineButton onClick={onClick} editor={editor} />
            <FontColorPickerButton />
            <FontHighlighterButton />
        </Flex>
    )
}