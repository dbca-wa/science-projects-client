// WIP Button to download the html, markdown or json of the content in the editor. 

import { FaDownload } from "react-icons/fa"
import { BaseOptionsButton } from "./BaseOptionsButton"

export const DownloadButton = () => {
    return (
        <BaseOptionsButton
            icon={FaDownload}
            // colorScheme=""
            onClick={() => { console.log('downloading') }}
        />
    )
}