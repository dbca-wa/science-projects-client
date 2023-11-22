// A dropdown Menu Button, that contains insert options for:
// Horizontal Rule, Image, GIF, Excalidraw, Table, Table (experimental), 
// Poll, Equation, Sticky Note, Collapsible Container, Tweet, Youtube Video,
// Figma Document. Most are disabled depending on the editor type

import { AiOutlinePlus } from "react-icons/ai"
import { FaCaretDown, FaFigma, FaPlay, FaTable, FaTwitter, FaYoutube } from "react-icons/fa"
import { BaseToolbarMenuButton } from "../Buttons/BaseToolbarMenuButton"
import { BsFileImage, BsFiletypeGif, BsPlusSlashMinus, BsSticky, BsTable } from "react-icons/bs"
import { RxViewHorizontal } from "react-icons/rx"
import { TbAlphabetGreek, TbBinaryTree2 } from "react-icons/tb"
import { MdPoll } from "react-icons/md"

export const InsertTableButton = () => {
    const TableFunc = () => {
        console.log("Table")
    }
    return (
        <BaseToolbarMenuButton
            title="Insert"
            menuIcon={AiOutlinePlus}
            menuItems={[
                {
                    leftIcon: BsTable,
                    text: 'Table',
                    onClick: TableFunc,
                },

            ]}

        />
    )
}