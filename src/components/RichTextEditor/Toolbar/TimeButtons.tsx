// Buttons to go back and forth based on changes made to the document

import { Flex } from "@chakra-ui/react"
import { UndoButton } from "../Buttons/UndoButton"
import { RedoButton } from "../Buttons/RedoButton"
import { useState } from "react";
import { IToolbarButton } from "../../../types";

export const TimeButtons = ({ onClick }: IToolbarButton) => {

    const [canUndo, setCanUndo] = useState<boolean>(true);
    const [canRedo, setCanRedo] = useState<boolean>(true);

    return (
        <Flex
        >
            <UndoButton disabled={!canUndo} onClick={onClick} />
            <RedoButton disabled={!canRedo} onClick={onClick} />
        </Flex>

    )
}