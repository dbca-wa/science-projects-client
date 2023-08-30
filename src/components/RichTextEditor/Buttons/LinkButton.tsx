// A button for setting a text node to and from a hyperlink

import { BsLink45Deg } from "react-icons/bs"
import { BaseToolbarButton } from "./BaseToolbarButton"

export const LinkButton = () => {
    return (
        <BaseToolbarButton>
            <BsLink45Deg />
        </BaseToolbarButton>
    )
}