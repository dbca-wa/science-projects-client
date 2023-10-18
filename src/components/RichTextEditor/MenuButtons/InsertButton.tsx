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

interface Props {
    editorType?: string;
}


export const InsertButton = ({ editorType = "projectDocument" }: Props) => {

    const HorizontalRuleFunc = () => {
        console.log("Horizontal Rule")
    }

    const ImageFunc = () => {
        console.log("Image")
    }

    const GIFFunc = () => {
        console.log("GIF")
    }

    const ExcalidrawFunc = () => {
        console.log("Excalidraw")
    }

    const TableFunc = () => {
        console.log("Table")
    }

    const ExperimentalTableFunc = () => {
        console.log("Experimental Table")
    }

    const PollFunc = () => {
        console.log("Poll")
    }


    const EquationFunc = () => {
        console.log("Equation")
    }

    const StickyNoteFunc = () => {
        console.log("Sticky Note")
    }

    const CollapsibleContainerFunc = () => {
        console.log("Collapsible Container")
    }

    const TwitterFunc = () => {
        console.log("Twitter")
    }

    const YoutubeFunc = () => {
        console.log("Youtube")
    }

    const FigmaFunc = () => {
        console.log("Figma")
    }

    const SpecialCharFunc = () => {
        console.log("Special Char")
    }

    return (
        <BaseToolbarMenuButton
            title="Add"
            menuIcon={AiOutlinePlus}
            menuItems={[
                {
                    leftIcon: RxViewHorizontal,
                    text: 'Horizontal Rule',
                    onClick: HorizontalRuleFunc,
                },
                {
                    leftIcon: BsTable,
                    text: 'Table',
                    onClick: TableFunc,
                },
                ...(editorType !== "projectDocument" ? [
                    {
                        leftIcon: TbAlphabetGreek,
                        text: 'Special Character',
                        onClick: SpecialCharFunc,
                    },
                    {
                        leftIcon: BsFileImage,
                        text: 'Image',
                        onClick: ImageFunc,
                    },
                    {
                        leftIcon: BsFiletypeGif,
                        text: 'GIF',
                        onClick: GIFFunc,
                    },
                    {
                        leftIcon: TbBinaryTree2,
                        text: 'Excalidraw',
                        onClick: ExcalidrawFunc,
                    },

                    {
                        leftIcon: FaTable,
                        text: 'Table (Experimental)',
                        onClick: ExperimentalTableFunc,
                    },
                    {
                        leftIcon: MdPoll,
                        text: 'Poll',
                        onClick: PollFunc,
                    },
                    {
                        leftIcon: BsPlusSlashMinus,
                        text: 'Equation',
                        onClick: EquationFunc,
                    },
                    {
                        leftIcon: BsSticky,
                        text: 'Sticky Note',
                        onClick: StickyNoteFunc,
                    },
                    {
                        leftIcon: FaPlay,
                        text: 'Collapsible Container',
                        onClick: CollapsibleContainerFunc,
                    },
                    {
                        leftIcon: FaTwitter,
                        text: 'Tweet',
                        onClick: TwitterFunc,
                    },
                    {
                        leftIcon: FaYoutube,
                        text: 'Youtube Video',
                        onClick: YoutubeFunc,
                    },
                    {
                        leftIcon: FaFigma,
                        text: 'Figma Document',
                        onClick: FigmaFunc,
                    },

                ] : []),
            ]}

        />
    )
}