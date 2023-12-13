// A button for undoing changes made to the editor state

import { FaUndo } from "react-icons/fa"
import { BaseToolbarButton } from "./BaseToolbarButton"

interface Props {
    disabled?: boolean;
    onClick: (event: string) => void;
}

export const UndoButton = ({ disabled, onClick }: Props) => {
    const eventType = "formatUndo"

    return (
        <BaseToolbarButton
            disabled={disabled}
            onClick={() => {
                onClick(eventType);
            }}
        >
            <FaUndo />
        </BaseToolbarButton>
    )
}