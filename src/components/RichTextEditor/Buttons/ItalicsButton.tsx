// Button for switching between italicised text

import { FaItalic } from "react-icons/fa"
import { BaseToolbarButton } from "./BaseToolbarButton"
import { useState } from "react";
import { IToolbarButton } from "../../../types";

export const ItalicsButton = ({ onClick }: IToolbarButton) => {
    const [isActive, setIsActive] = useState(false);

    const italicsStateVisuals = () => {
        setIsActive(!isActive);
    }
    const eventType = "formatItalic"


    return (
        <BaseToolbarButton
            isActive={isActive}
            onClick={() => {
                italicsStateVisuals();
                onClick(eventType);
            }}
        >
            <FaItalic />
        </BaseToolbarButton>
    )
}