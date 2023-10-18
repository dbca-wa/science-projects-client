// WIP hook for communication between the editor area and the toolbar.

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
import {
    $createHeadingNode,
    $createQuoteNode,
} from "@lexical/rich-text"
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

import { RefObject, useCallback, useState } from "react";

// interface IProps {
//     eventType: string;
//     buttonFunc: () => void;
// }

interface Props {
    editorRef: RefObject<HTMLTextAreaElement>; // Use RefObject to represent the textarea element reference
    currentlySelectedNode?: string;
}

export const useToolbarClickListener = ({ editorRef, currentlySelectedNode }: Props) => {
    const [editor] = useLexicalComposerContext();
    const [blockType, setBlockType] = useState("paragraph");
    const [selectedElementKey, setSelectedElementKey] = useState(null);
    const [isRTL, setIsRTL] = useState(false);
    const [isLink, setIsLink] = useState(false);


    const onClick = (event: any) => {

        // ['h1', 'h2', 'h3', 'paragraph','ol','ul', 'quote']

        // console.log(event)
        if (event === "formatUndo") {
            // editor.dispatchCommand(UNDO_COMMAND, undefined);
            console.log("undo")
        } else if (event === "formatRedo") {
            // editor.dispatchCommand(REDO_COMMAND, undefined);
            console.log("redo")
        }
        else if (event === "paragraph" && currentlySelectedNode !== "paragraph") {
            formatParagraph();
            console.log("set paragraph")
            console.log(event)

        }
        else if (event === "h1" && currentlySelectedNode !== "h1") {
            // formatLargeHeading();
            console.log("set h1")

        }
        else if (event === "h2" && currentlySelectedNode !== "h2") {
            // formatMidHeading();
            console.log("set h2")

        }
        else if (event === "h3" && currentlySelectedNode !== "h3") {
            // formatSmallHeading();
            console.log("set h3")

        }
        else if (event === "ol" && currentlySelectedNode !== "ol") {
            // formatNumberedList();
            console.log("set ol")

        }
        else if (event === "ul" && (currentlySelectedNode !== "ul" || "li")) {
            formatBulletList();
            console.log("set ul")

        }
        else if (event === "li" && (currentlySelectedNode !== "ul" || "li")) {
            // formatBulletList();
            console.log("set li")

        }
        else if (event === "quote" && currentlySelectedNode !== "quote") {
            // formatQuote();
            console.log("set quote")

        }

        else if (event === "formatAlignLeft") {
            // editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")
        } else if (event === "formatAlignCenter") {
            // editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")
        } else if (event === "formatAlignRight") {
            // editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")
        } else if (event === "formatAlignJustify") {
            // editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
        }
        else if (event === "formatBold") {
            // editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        } else if (event === "formatItalic") {
            // editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }
        else if (event === "formatUnderline") {
            // editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }

    }
    // else if (event === "formatInsertLink") {
    //     insertLink();
    // }
    // else if (event === "formatStrike") {
    //     editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
    // } else if (event === "formatSubscript") {
    //     editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
    // } else if (event === "formatSuperscript") {
    //     editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
    // } 

    const formatParagraph = () => {
        // console.log(blockType)
        if (blockType !== "paragraph") {
            editor.update(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createParagraphNode());
                }
            });
        }
    };

    const formatLargeHeading = () => {
        if (blockType !== "h1") {
            editor.update(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createHeadingNode("h1"));
                }
            });
        }
    };


    const formatMidHeading = () => {
        if (blockType !== "h2") {
            editor.update(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createHeadingNode("h2"));
                }
            });
        }
    };

    const formatSmallHeading = () => {
        if (blockType !== "h3") {
            editor.update(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createHeadingNode("h3"));
                }
            });
        }
    };

    const formatBulletList = () => {
        if (blockType !== "ul" && blockType !== "li") {
            console.log("dispatch command ");
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const formatNumberedList = () => {
        if (blockType !== "ol") {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const formatQuote = () => {
        if (blockType !== "quote") {
            editor.update(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createQuoteNode());
                }
            });
        }
    };

    // const insertLink = useCallback(() => {
    //     if (!isLink) {
    //         editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    //     } else {
    //         editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    //     }
    // }, [editor, isLink]);




    if (editorRef.current) {
        editorRef.current.focus(); // Focus on the textarea element using the ref
    }

    return { onClick };
}

// function getSelectedNode(selection) {
//     const anchor = selection.anchor;
//     const focus = selection.focus;
//     const anchorNode = selection.anchor.getNode();
//     const focusNode = selection.focus.getNode();
//     if (anchorNode === focusNode) {
//         return anchorNode;
//     }
//     const isBackward = selection.isBackward();
//     if (isBackward) {
//         return $isAtNodeEnd(focus) ? anchorNode : focusNode;
//     } else {
//         return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
//     }
// }