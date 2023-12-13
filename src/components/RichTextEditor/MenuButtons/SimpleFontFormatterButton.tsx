// A dropdown menu button containing Strikethrough, Subscript, Superscript, and Clear Formatting Options

import { RxLetterCaseCapitalize } from "react-icons/rx"
import { BaseToolbarMenuButton } from "../Buttons/BaseToolbarMenuButton"
import { AiOutlineStrikethrough } from "react-icons/ai"
import { MdSubscript, MdSuperscript } from "react-icons/md"
import { BsTrash3 } from "react-icons/bs"
import { useState } from "react"
import { LexicalEditor } from "lexical"

interface Props {
    editor: LexicalEditor
}
export const SimpleFontFormatterButton = ({ editor }: Props) => {

    const [currentTitle, setCurrentTitle] = useState<string>('Format')

    const SubscriptFunc = () => {
        setCurrentTitle("Sub")
    }
    const SuperscriptFunc = () => {
        setCurrentTitle("Super")
    }
    const ClearFormattingFunc = () => {
        setCurrentTitle("Clear")
    }


    return (
        <BaseToolbarMenuButton
            title={currentTitle}
            menuIcon={
                currentTitle === "Strike" || currentTitle === "Strikethrough" ? AiOutlineStrikethrough :
                    currentTitle === "Sub" || currentTitle === "Subscript" ? MdSubscript :
                        currentTitle === "Super" || currentTitle === "Superscript" ? MdSuperscript :
                            currentTitle === "Clear" || currentTitle === "Clear Formatting" ? BsTrash3 :
                                RxLetterCaseCapitalize}
            menuItems={[

                {
                    leftIcon: MdSubscript,
                    text: "Subscript",
                    onClick: SubscriptFunc,
                },
                {
                    leftIcon: MdSuperscript,
                    text: "Superscript",
                    onClick: SuperscriptFunc,
                },
                {
                    leftIcon: BsTrash3,
                    text: "Clear Formatting",
                    onClick: ClearFormattingFunc,
                },
            ]}
        />
    )
}