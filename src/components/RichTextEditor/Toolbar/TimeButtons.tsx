// Buttons to go back and forth based on changes made to the document

import { Flex } from "@chakra-ui/react"
import { UndoButton } from "../Buttons/UndoButton"
import { RedoButton } from "../Buttons/RedoButton"
import { useEffect, useState } from "react";
import { IToolbarButton } from "../../../types";
import {
    mergeRegister,
} from '@lexical/utils';
import { CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_CRITICAL } from "lexical";
export const TimeButtons = ({ onClick, editor }: IToolbarButton) => {

    const [canUndo, setCanUndo] = useState<boolean>(false);
    const [canRedo, setCanRedo] = useState<boolean>(false);

    // useEffect(() => {

    // })

    //   const [editor] = useLexicalComposerContext();
    const [activeEditor, setActiveEditor] = useState(editor);
    useEffect(() => {
        return mergeRegister(
            //   editor.registerEditableListener((editable) => {
            //     setIsEditable(editable);
            //   }),
            //   activeEditor.registerUpdateListener(({editorState}) => {
            //     editorState.read(() => {
            //       $updateToolbar();
            //     });
            //   }),
            activeEditor.registerCommand<boolean>(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            activeEditor.registerCommand<boolean>(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
        );
    }, [
        // $updateToolbar, 
        activeEditor, editor]);


    return (
        <Flex
        >
            <UndoButton disabled={!canUndo} onClick={onClick} />
            <RedoButton disabled={!canRedo} onClick={onClick} />
        </Flex>

    )
}