// WIP Button to download the html, markdown or json of the content in the editor. 

import { TbBinaryTree } from "react-icons/tb"
import { BaseOptionsButton } from "./BaseOptionsButton"

import { Box, Button } from "@chakra-ui/react"
import { useState } from "react"
import { BsUnlockFill, BsLockFill } from "react-icons/bs"
import { BaseToggleOptionsButton } from "./BaseToggleOptionsButton";

interface TreeButtonProps {
    shouldShowTree: boolean;
    setShouldShowTree: React.Dispatch<React.SetStateAction<boolean>>;
    editorText: string;
    rawHTML: string;
}

export const TreeButton = ({ shouldShowTree, setShouldShowTree, editorText, rawHTML }: TreeButtonProps) => {
    // const [isShown, setIsShown] = useState<boolean>(shouldShowTree);
    return (
        <Box
        // onClick={() => {
        //     if (shouldShowTree === false) {
        //         console.log(editorText)
        //         console.log(rawHTML)
        //     }
        // }}
        >

            <BaseToggleOptionsButton
                iconOne={TbBinaryTree}
                iconTwo={TbBinaryTree}
                colorSchemeOne={"yellow"}
                colorSchemeTwo={"orange"}
                currentState={shouldShowTree}
                setCurrentState={setShouldShowTree}
                toolTipText={!shouldShowTree ? "Show Tree" : "Hide Tree"}
            />
        </Box>

    )
}
