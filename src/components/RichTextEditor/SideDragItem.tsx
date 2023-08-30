// A button present on every node and to the left side to indicate draggable
// This is used to move elements around in the rich text editor to where you need
// This will save the document once moved

import { Button } from "@chakra-ui/react"
import { MdDragIndicator } from "react-icons/md"

export const SideDragItem = () => {
    return (
        <Button>
            <MdDragIndicator />
        </Button>
    )
}