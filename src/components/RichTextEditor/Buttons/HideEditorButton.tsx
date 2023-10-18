// A button to control whether the editor is shown or the actual text of the editor, once saved.

import { Box, Button } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { BsUnlockFill, BsLockFill } from "react-icons/bs"
import { BaseToggleOptionsButton } from "./BaseToggleOptionsButton";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html"
import { AiFillEyeInvisible, AiFillEye, AiFillEdit } from 'react-icons/ai';
import { LexicalEditor } from "lexical";

interface Props {
    editorIsOpen: boolean;
    setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editorProp?: LexicalEditor;
    // setDisplayData: React.Dispatch<React.SetStateAction<string>>;
    editorText: string;
    rawHTML?: string;
}

export const HideEditorButton = ({ editorIsOpen, setIsEditorOpen,
    // setDisplayData, 
    editorText, rawHTML, editorProp }: Props) => {


    // const [editor] = useLexicalComposerContext();


    const toggleEditable = () => {
        if (editorIsOpen) {
            // setIsEditorOpen(false);
            editorProp.setEditable(false);
            // setDisplayData(editorText);

        }
        else {
            // setIsEditorOpen(true);
            editorProp.setEditable(true);
            // setDisplayData(editorText);
        }
    }

    return (
        <Box
            onClick={toggleEditable}
        >
            <BaseToggleOptionsButton
                iconOne={AiFillEdit}
                colorSchemeOne="green"
                iconTwo={AiFillEyeInvisible}
                colorSchemeTwo="blue"
                currentState={editorIsOpen}
                setCurrentState={setIsEditorOpen}
                toolTipText={!editorIsOpen ? "Show Editor" : "Hide Editor"}
                editorIsOpen={editorIsOpen}
            />

        </Box>
    )
}
