// A rich text button to determine an element type and insert it as a new node.
// Allows for changing Paragraphs, H1-3, Lists, Quotes.

import {
    BsTextParagraph,
    BsChatSquareQuote,
    BsCodeSlash,
    BsTypeH1,
    BsTypeH2,
    BsTypeH3,
} from "react-icons/bs";
import { MdFormatListBulleted, MdFormatListNumbered } from "react-icons/md";
import { BaseToolbarMenuButton } from "../Buttons/BaseToolbarMenuButton";

import { useEffect, useState } from "react";
import { NodeType, useSelectedNode } from "../../../lib/hooks/LexicalSelectedNodeContext";

interface Props {
    isSmall?: boolean;
    onClick: (event: string) => void;
}

export const ElementTypeButton = ({ isSmall, onClick }: Props) => {
    const [currentTitle, setCurrentTitle] = useState<string>(isSmall ? "Norm" : "Normal");

    const { selectedNodeType, setSelectedNodeType } = useSelectedNode();


    useEffect(() => {
        let eventType: NodeType = 'paragraph'; // Initialize eventType as paragraph

        switch (currentTitle) {
            case 'Normal':
            case 'Norm':
                eventType = 'paragraph';
                break;
            case 'H1':
            case 'Heading 1':
                eventType = 'h1';
                break;
            case 'H2':
            case 'Heading 2':
                eventType = 'h2';
                break;
            case 'H3':
            case 'Heading 3':
                eventType = 'h3';
                break;
            case 'Bullets':
            case 'Bullet List':
                eventType = 'ul';
                break;
            case 'Nums':
            case 'Numbered List':
                eventType = 'ol';
                break;
            case 'Quote':
                eventType = 'quote';
                break;
            case 'Code':
            case 'Code Block':
                eventType = 'quote';
                break;
            default:
                eventType = 'paragraph';
        }
        if (setSelectedNodeType) {
            setSelectedNodeType(eventType);

        }
        onClick(eventType);

        // console.log(currentTitle)
    }, [currentTitle, onClick]);



    const NormalFunc = () => {
        setCurrentTitle("Norm");
    };

    const HeadingOneFunc = () => {
        setCurrentTitle(
            isSmall ? "H1" : "Heading 1"
        );
    };

    const HeadingTwoFunc = () => {
        setCurrentTitle(
            isSmall ? "H2" : "Heading 2"
        );
    };

    const HeadingThreeFunc = () => {
        setCurrentTitle(
            isSmall ? "H3" : "Heading 3"
        );
    };

    const BulletListFunc = () => {
        setCurrentTitle(
            isSmall ? "Bullets" : "Bullet List"
        );
    };

    const NumberedListFunc = () => {
        setCurrentTitle(
            isSmall ? "Nums" : "Numbered List"
        );
    };

    const QuoteFunc = () => {
        setCurrentTitle("Quote");
    };

    const CodeBlockFunc = () => {
        setCurrentTitle(
            isSmall ? "Code" : "Code Block"
        );
    };

    return (
        <BaseToolbarMenuButton
            menuIcon={
                currentTitle === "Normal" ?
                    BsTextParagraph :
                    currentTitle === "Heading 1" || currentTitle === "H1" ?
                        BsTypeH1 :
                        currentTitle === "Heading 2" || currentTitle === "H2" ?
                            BsTypeH2 :
                            currentTitle === "Heading 3" || currentTitle === "H3" ?
                                BsTypeH3 :
                                currentTitle === "Bullet List" || currentTitle === "Bullets" ?
                                    MdFormatListBulleted :
                                    currentTitle === "Numbered List" || currentTitle === "Nums" ?
                                        MdFormatListNumbered :
                                        currentTitle === "Quote" ?
                                            BsChatSquareQuote :
                                            currentTitle === "Code Block" || currentTitle === "Code" ?
                                                BsCodeSlash :
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
                    leftIcon: BsTypeH1,
                    text: "Heading 1",
                    onClick: HeadingOneFunc,
                },
                {
                    leftIcon: BsTypeH2,
                    text: "Heading 2",
                    onClick: HeadingTwoFunc,
                },
                {
                    leftIcon: BsTypeH3,
                    text: "Heading 3",
                    onClick: HeadingThreeFunc,
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

                {
                    leftIcon: BsChatSquareQuote,
                    text: 'Quote',
                    onClick: QuoteFunc,
                },
                // {
                //     leftIcon: BsCodeSlash,
                //     text: 'Code Block',
                //     onClick: CodeBlockFunc,
                // },
            ]
            }
        />
    )
}