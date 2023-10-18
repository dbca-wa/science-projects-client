// A button to clear the rich text editor of all information

import { FaTrashAlt } from "react-icons/fa"
import { BaseOptionsButton } from "./BaseOptionsButton"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { CLEAR_EDITOR_COMMAND, LexicalEditor } from "lexical"


interface Props {
    editor: LexicalEditor;
}

export const ClearButton = (
    // { editor }: Props
) => {
    const [editor] = useLexicalComposerContext();

    const clearEditor = () => {
        console.log("clear button clicked")
        console.log(editor.getEditorState())

        editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        editor.focus();

    }
    return (
        <BaseOptionsButton
            icon={FaTrashAlt}
            colorScheme={"red"}
            onClick={clearEditor}
            toolTipText="Clear"
        />
    )
}