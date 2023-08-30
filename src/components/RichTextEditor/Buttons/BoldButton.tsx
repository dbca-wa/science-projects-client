// A button to bold or unbold text nodes

import { FaBold } from "react-icons/fa"
import { BaseToolbarButton } from "./BaseToolbarButton"
import { useState } from "react"
import { IToolbarButton } from "../../../types";

export const BoldButton = ({ onClick }: IToolbarButton) => {

    const [isActive, setIsActive] = useState(false);
    const boldStateVisuals = () => {
        setIsActive(!isActive);
    }
    const eventType = "formatBold"

    return (
        <BaseToolbarButton
            isActive={isActive}
            onClick={() => {
                boldStateVisuals();
                onClick(eventType);
            }}
        >
            <FaBold />
        </BaseToolbarButton>
    )
}