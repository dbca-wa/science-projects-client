// Section containing the core font formatting buttons

import { Flex } from "@chakra-ui/react"
import { BoldButton } from "../Buttons/BoldButton"
import { ItalicsButton } from "../Buttons/ItalicsButton"
import { UnderlineButton } from "../Buttons/UnderlineButton"
import { FontColorPickerButton } from "../MenuButtons/FontColorPickerButton"
import { FontHighlighterButton } from "../MenuButtons/FontHighlighterButton"
import { useToolbarClickListener } from "../../../lib/hooks/useToolbarClickListener"
import { RefObject } from "react"


interface Props {
    editorRef: RefObject<HTMLTextAreaElement>;
}

export const FontFormattingButtons = ({ editorRef }: Props) => {

    const { onClick } = useToolbarClickListener({ editorRef: editorRef });

    return (
        <Flex
        // flexGrow={1}
        >
            <BoldButton onClick={onClick} />
            <ItalicsButton onClick={onClick} />
            <UnderlineButton onClick={onClick} />
            <FontColorPickerButton />
            <FontHighlighterButton />
        </Flex>
    )
}