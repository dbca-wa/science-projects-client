// A dropdown menu button containing Strikethrough, Subscript, Superscript, and Clear Formatting Options

import { RxLetterCaseCapitalize } from "react-icons/rx"
import { BaseToolbarMenuButton } from "../Buttons/BaseToolbarMenuButton"
import { MdSubscript, MdSuperscript } from "react-icons/md"
import { BsTrash3 } from "react-icons/bs"
import { useState } from "react"


interface Props {
    onClick: (eventName: any) => void;
}

export const FontFormatterButton = (
    { onClick }: Props
) => {

    const [currentTitle, setCurrentTitle] = useState<string>('Format')

    const SubscriptFunc = () => {
        setCurrentTitle("Sub")
        onClick('formatSubscript');
    }
    const SuperscriptFunc = () => {
        setCurrentTitle("Super")
        onClick('formatSuperscript');

    }
    const ClearFormattingFunc = () => {
        setCurrentTitle("Clear");
        onClick('clearFormatting');

    }


    return (
        <BaseToolbarMenuButton
            title={currentTitle}
            menuIcon={
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