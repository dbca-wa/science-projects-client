// A rich text button to determine an element type and insert it as a new node.
// Allows for changing Paragraphs, H1-3, Lists, Quotes.

import {
    BsTextParagraph
} from "react-icons/bs";
import { MdFormatListBulleted, MdFormatListNumbered } from "react-icons/md";
import { BaseToolbarMenuButton } from "../Buttons/BaseToolbarMenuButton";

import { SetStateAction, useEffect, useState } from "react";

interface Props {
    isSmall?: boolean;
    shouldFurtherConcat?: boolean;
    onClick: (event: string) => void;
    currentlyClickedNode: string;
    setCurrentlyClickedNode: React.Dispatch<SetStateAction<string>>;
}

export const ElementTypeButton = ({ isSmall, onClick, shouldFurtherConcat, setCurrentlyClickedNode, currentlyClickedNode }: Props) => {
    const [currentTitle, setCurrentTitle] = useState<string>(shouldFurtherConcat || isSmall ? "Norm" : "Normal");


    useEffect(() => {
        let eventType = ''; // 

        switch (currentTitle) {
            case 'Normal':
            case 'Norm':
                eventType = 'paragraph';
                break;
            case 'Bullets':
            case 'Bullet List':
                eventType = 'ul';
                break;
            case 'Nums':
            case 'Numbered List':
                eventType = 'ol';
                break;
            default:
                eventType = 'paragraph';
        }
        onClick(eventType);
    }, [currentTitle, onClick]);

    const NormalFunc = () => {
        setCurrentTitle("Norm");
    };

    const BulletListFunc = () => {
        setCurrentTitle(
            shouldFurtherConcat || isSmall ? "Bullets" : "Bullet List"
        );
    };

    const NumberedListFunc = () => {
        setCurrentTitle(
            shouldFurtherConcat || isSmall ? "Nums" : "Numbered List"
        );
    };

    return (
        <BaseToolbarMenuButton
            menuIcon={
                currentTitle === ("Normal" || "Norm") ?
                    BsTextParagraph :
                    currentTitle === "Bullet List" || currentTitle === "Bullets" ?
                        MdFormatListBulleted :
                        currentTitle === "Numbered List" || currentTitle === "Nums" ?
                            MdFormatListNumbered :
                            BsTextParagraph
            }
            title={currentTitle}
            menuItems={[
                {
                    leftIcon: BsTextParagraph,
                    text: "Normal",
                    onClick: NormalFunc,
                },
                {
                    leftIcon: MdFormatListBulleted,
                    text: 'Bullet List',
                    onClick: BulletListFunc,
                },
                {
                    leftIcon: MdFormatListNumbered,
                    text: 'Numbered List',
                    onClick: NumberedListFunc,
                },
            ]
            }
        />
    )
}