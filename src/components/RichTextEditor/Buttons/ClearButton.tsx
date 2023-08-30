// A button to clear the rich text editor of all information

import { FaTrashAlt } from "react-icons/fa"
import { BaseOptionsButton } from "./BaseOptionsButton"


export const ClearButton = () => {
    return (
        <BaseOptionsButton
            icon={FaTrashAlt}
            colorScheme={"red"}
            onClick={() => { console.log('hello') }}
        />
    )
}