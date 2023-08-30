// A button for formatting text as code

import { BsCodeSlash } from "react-icons/bs"
import { BaseToolbarButton } from "./BaseToolbarButton"

export const CodeBlockButton = () => {
    return (
        <BaseToolbarButton>
            <BsCodeSlash />
        </BaseToolbarButton>
    )
}