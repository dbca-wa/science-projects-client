// WIP: Handles the individual columns of each board (todo, inprogress, done)

import { Box } from "@chakra-ui/react"
import { DndContext, closestCenter } from "@dnd-kit/core"



export const KanbanColumn = () => {

    // const handleDragEnd = (result) => {
    //     // result is event
    //     console.log("hi")

    // const { destination, source, type } = result;

    // // Nope out if user drags outside of board
    // if (!destination) return;

    // // Handle column drag
    // if (type === "column") {
    //     const entries = Array.from(board.columns.entries());
    //     const [removed] = entries.splice(source.index, 1);
    //     entries.splice(destination.index, 0, removed);
    //     const rearrangedColumns = new Map(entries);
    //     setBoardState(
    //         { ...board, columns: rearrangedColumns, }
    //     )
    return (
        <Box>

        </Box>
    )
}
