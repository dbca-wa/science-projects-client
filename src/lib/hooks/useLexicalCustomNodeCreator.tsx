// WIP hook for creating custom nodes with Lexical.

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    $getSelection,
    $isRangeSelection,
    $createParagraphNode,
} from "lexical";
import { $wrapNodes, } from "@lexical/selection";
import {
    // $isLinkNode,
    TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
    // $isListNode,
    // ListNode,
} from "@lexical/list";

import { useCallback, useState } from "react";

// interface IProps {
//     eventType: string;
//     buttonFunc: () => void;
// }

export const useLexicalCustomNodeCreator = () => {
    const [editor] = useLexicalComposerContext();
    const [blockType, setBlockType] = useState("paragraph");
    const [selectedElementKey, setSelectedElementKey] = useState(null);
    const [isRTL, setIsRTL] = useState(false);
    const [isLink, setIsLink] = useState(false);



    //     return { 
    //         createParagraph, 
    //         createUL, 
    //         createOL, 
    //         createTable, 
    //         createNewLine, 
    //         createQuote, 
    //         createHeadingOne,
    //         createHeadingTwo, 
    //         createHeadingThree,
    //         createTable, 
    //         createSpecialCharacter, 
    //         createHorizontalRule, 
    //         createaCode,
    //     };
}
