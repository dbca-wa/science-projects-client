

import {
    BsTextParagraph
} from "react-icons/bs";
import { MdFormatListBulleted, MdFormatListNumbered } from "react-icons/md";
import { BaseToolbarMenuButton } from "../Buttons/BaseToolbarMenuButton";

import { SetStateAction, useEffect, useRef, useState } from "react";
import { $getSelection, LexicalEditor, RangeSelection } from "lexical";

interface Props {
    isSmall?: boolean;
    shouldFurtherConcat?: boolean;
    onClick: (event: string) => void;
    editor: LexicalEditor;
    selectedNodeType: string;
}

export const ElementTypeButton = ({ isSmall, onClick, shouldFurtherConcat, editor, selectedNodeType
    // setCurrentlyClickedNode, currentlyClickedNode 
}: Props) => {

    const [displayText, setDisplayText] = useState<string>(selectedNodeType ? selectedNodeType : "Normal");
    const selectionRef = useRef<RangeSelection | null>(null);

    useEffect(() => {
        if (selectedNodeType) {
            setDisplayText(selectedNodeType)
        }
    }, [selectedNodeType])

    // const [currentlyClickedNode, setCurrentlyClickedNode] = useState(editor.getEditorState().read(() => {
    //     const selection = $getSelection();
    //     // selection.getNodes();
    //     console.log(selection.getNodes())
    // }));


    // useEffect(() => {
    //     editor.getEditorState().read(() => {
    //         // const selection = $getSelection();
    //         // selection.getNodes();
    //         editor.focus()
    //         // console.log('NODES: ', selection.getNodes())
    //     })
    // }, [editor])

    const clickedOnOrdinaryText = () => {
        setDisplayText("Norm")
    }

    const clickedOnBulletText = () => {
        setDisplayText(
            shouldFurtherConcat || isSmall ? "Bullets" : "Bullet List"
        )
    }

    const clickedOnNumberedText = () => {
        setDisplayText(
            shouldFurtherConcat || isSmall ? "Nums" : "Numbered List"
        )
    }

    return (
        <BaseToolbarMenuButton
            onClick={() => {
                editor.focus()
                console.log('focusing editor')
            }}
            menuIcon={
                displayText === ("Normal" || "Norm") ?
                    BsTextParagraph :
                    displayText === "Bullet List" || displayText === "Bullets" ?
                        MdFormatListBulleted :
                        displayText === "Numbered List" || displayText === "Nums" ?
                            MdFormatListNumbered :
                            BsTextParagraph
            }
            title={displayText}
            menuItems={[
                {
                    leftIcon: BsTextParagraph,
                    text: "Normal",
                    onClick: () => { onClick('formatParagraph') },
                },
                {
                    leftIcon: MdFormatListBulleted,
                    text: 'Bullet List',
                    onClick: () => { onClick('ul') },
                },
                {
                    leftIcon: MdFormatListNumbered,
                    text: 'Numbered List',
                    onClick: () => { onClick('ol') },
                },
            ]
            }
        />
    )
}