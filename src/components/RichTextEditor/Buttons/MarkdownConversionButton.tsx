// A button to convert back and forth between Markdown and RichText


import { Button } from "@chakra-ui/react"
import { useState } from "react";
import { BsMarkdownFill, BsMarkdown } from "react-icons/bs"
import { BaseToggleOptionsButton } from "./BaseToggleOptionsButton";


export const MarkDownConversionButton = () => {
    const [isMarkdownMode, setIsMarkdownMode] = useState<boolean>(false);
    return (
        <BaseToggleOptionsButton
            iconOne={BsMarkdownFill}
            iconTwo={BsMarkdown}
            currentState={isMarkdownMode}
            setCurrentState={setIsMarkdownMode}
        />
    )
}