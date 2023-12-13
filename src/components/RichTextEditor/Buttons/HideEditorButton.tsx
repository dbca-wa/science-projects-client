// A button to control whether the editor is shown or the actual text of the editor, once saved.

import { Box } from "@chakra-ui/react"
import { BaseToggleOptionsButton } from "./BaseToggleOptionsButton";
import { AiFillEyeInvisible, AiFillEdit } from 'react-icons/ai';

interface Props {
    setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editorIsOpen: boolean;
}

export const HideEditorButton = ({
    editorIsOpen,
    setIsEditorOpen
}: Props) => {


    return (
        <Box
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
