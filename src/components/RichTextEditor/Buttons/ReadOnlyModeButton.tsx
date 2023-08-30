// A button to control whether the box is editable.
// This will by default be implemented once a document has been approved.
// Only the system, directorate or program leader can click the button again to enable editing.

import { Button } from "@chakra-ui/react"
import { useState } from "react"
import { BsUnlockFill, BsLockFill } from "react-icons/bs"
import { BaseToggleOptionsButton } from "./BaseToggleOptionsButton";

export const ReadOnlyModeButton = () => {
    const [isLocked, setIsLocked] = useState<boolean>(false);
    return (
        <BaseToggleOptionsButton
            iconOne={BsUnlockFill}
            iconTwo={BsLockFill}
            colorSchemeOne={"blue"}
            colorSchemeTwo={"green"}
            currentState={isLocked}
            setCurrentState={setIsLocked}
        />
    )
}