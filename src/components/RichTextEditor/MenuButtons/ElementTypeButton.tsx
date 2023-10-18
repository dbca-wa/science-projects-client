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

import { SetStateAction, useEffect, useState } from "react";
// import { NodeType, useSelectedNode } from "../../../lib/hooks/LexicalSelectedNodeContext";

interface Props {
    isSmall?: boolean;
    shouldFurtherConcat?: boolean;
    onClick: (event: string) => void;
    currentlyClickedNode: string;
    setCurrentlyClickedNode: React.Dispatch<SetStateAction<string>>;
}

export const ElementTypeButton = ({ isSmall, onClick, shouldFurtherConcat, setCurrentlyClickedNode, currentlyClickedNode }: Props) => {
    const [currentTitle, setCurrentTitle] = useState<string>(shouldFurtherConcat || isSmall ? "Norm" : "Normal");
    // const { selectedNodeType, setSelectedNodeType } = useSelectedNode();


    useEffect(() => {
        let eventType = ''; // 

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
        // if (setSelectedNodeType) {
        //     setSelectedNodeType(eventType);

        // }
        onClick(eventType);

        // console.log(currentTitle)
    }, [currentTitle, onClick]);


    // useEffect(() => {
    //     console.log(currentTitle)
    //     console.log(currentlyClickedNode)
    //     if (currentlyClickedNode === "paragraph" && currentTitle !== "Norm") {
    //         HeadingOneFunc()
    //     }
    //     else if (currentlyClickedNode === "li" && (currentTitle !== "Bullets" || "Bullet List")) {
    //         BulletListFunc()
    //     }

    // }, [currentlyClickedNode, currentTitle])

    const NormalFunc = () => {
        setCurrentTitle("Norm");
    };

    const HeadingOneFunc = () => {
        setCurrentTitle(
            shouldFurtherConcat || isSmall ? "H1" : "Heading 1"
        );
    };

    const HeadingTwoFunc = () => {
        setCurrentTitle(
            shouldFurtherConcat || isSmall ? "H2" : "Heading 2"
        );
    };

    const HeadingThreeFunc = () => {
        setCurrentTitle(
            shouldFurtherConcat || isSmall ? "H3" : "Heading 3"
        );
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

    const QuoteFunc = () => {
        setCurrentTitle("Quote");
    };

    const CodeBlockFunc = () => {
        setCurrentTitle(
            shouldFurtherConcat || isSmall ? "Code" : "Code Block"
        );
    };

    return (
        <BaseToolbarMenuButton
            menuIcon={
                currentTitle === ("Normal" || "Norm") ?
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