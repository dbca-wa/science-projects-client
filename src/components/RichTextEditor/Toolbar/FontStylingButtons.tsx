// Section containing the Font Styles buttons

import { Flex } from "@chakra-ui/react"
import { TextSizeButton } from "../MenuButtons/TextSizeButton"
import { FontSelectorButton } from "../MenuButtons/FontSelectorButton"

export const FontStylingButtons = () => {
    return (
        <Flex
        >
            <FontSelectorButton />
            <TextSizeButton />
        </Flex>
    )
}