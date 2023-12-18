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
import { MdFormatListBulleted, MdFormatListNumbered, MdPoll } from "react-icons/md"
import { InsertTableModal } from "@/components/Modals/RTEModals/InsertTableModal"
import { useDisclosure } from "@chakra-ui/react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

interface Props {
    onClick: (event: string) => void;
}
export const InsertItemMenuButton = ({ onClick }: Props) => {

    const { isOpen: isAddTableOpen, onClose: onAddTableClose, onOpen: onAddTableOpen } = useDisclosure();
    const TableFunc = () => {
        console.log("Table");
        // onClick('insertTable');
        onAddTableOpen();
    }

    const BulletListFunc = () => {
        console.log("BulletListFunc");

        onClick('ul');
        // onAddTableOpen();
    }


    const NumberListFunc = () => {
        console.log("NumberListFunc");
        onClick('ol');
        // onAddTableOpen();
    }


    const [editor] = useLexicalComposerContext();
    return (
        <>
            <InsertTableModal isOpen={isAddTableOpen} activeEditor={editor} onClose={onAddTableClose} />
            <BaseToolbarMenuButton
                title="Insert"
                menuIcon={AiOutlinePlus}
                menuItems={[
                    {
                        leftIcon: MdFormatListBulleted,
                        text: 'Bullet List',
                        onClick: BulletListFunc,
                    },
                    {
                        leftIcon: MdFormatListNumbered,
                        text: 'Numbered List',
                        onClick: NumberListFunc,
                    },
                    {
                        leftIcon: BsTable,
                        text: 'Table',
                        onClick: TableFunc,
                    },

                ]}

            />

        </>
    )
}