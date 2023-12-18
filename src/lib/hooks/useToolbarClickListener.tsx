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
    $INTERNAL_isPointSelection,
    LexicalEditor,
    $isTextNode,
} from "lexical";
import {$getNearestBlockElementAncestorOrThrow,} from '@lexical/utils';

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
import { InsertTableModal } from "@/components/Modals/RTEModals/InsertTableModal";
import { useDisclosure } from "@chakra-ui/react";
import {$setBlocksType} from '@lexical/selection';

// interface IProps {
//     eventType: string;
//     buttonFunc: () => void;
// }

interface Props {
    // editor: LexicalEditor; // The editor this is listening to
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

        console.log("Event is: ", event)
        if (event === "formatUndo") {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
            console.log("undo")
        } else if (event === "formatRedo") {
            editor.dispatchCommand(REDO_COMMAND, undefined);
            console.log("redo")
        }
        else if (event === "formatBold") {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            console.log("bold")
        } else if (event === "formatItalic") {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            console.log("italic")
        }
        else if (event === "formatUnderline") {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            console.log("underline")
        } else if (event === "insertTable") {
            console.log('running table insert')
            // onAddTableOpen();
        }

        else if (event === "formatSubscript") {
            console.log("format subscript function ran")
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
        } else if (event === "formatSuperscript") {
            console.log("format superscript function ran")
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
        } else if (event === "clearFormatting") {
            console.log("clear format function ran");
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const anchor = selection.anchor;
                    const focus = selection.focus;
                    const nodes = selection.getNodes();

                    if (anchor.key === focus.key && anchor.offset === focus.offset) {
                        return;
                    }

                    // Iterate4 over each node 
                    nodes.forEach((node, index) => {
                        if($isTextNode(node)) {
                            let textNode = node;
                            if (index === 0 && anchor.offset !== 0) {
                                textNode = textNode.splitText(anchor.offset)[1] || textNode;
                            }
                            if (index === nodes.length -1) {
                                textNode = textNode.splitText(focus.offset)[0] || textNode;
                            }

                            if (textNode.__style !== '') {
                                textNode.setStyle('');
                            }

                            if (textNode.__format !== 0) {
                                textNode.setFormat(0);
                                $getNearestBlockElementAncestorOrThrow(textNode).setFormat('');
                            }
                            node = textNode;
                        } 
                        // Potentially unused in SPMS as we are not allowing heading/quite/decor nodes
                        // else if ($isHeadingNode(node) || $isQuoteNode(node)) {
                        //     node.replace($createParagraphNode(), true);
                        // } else if ($isDecoratorBlockNode(node)) {
                        //     node.setFormat('');
                        // }
                    })

                }
            })
        }


       else if (event === "ol" 
    //    && currentlySelectedNode !== "ol"
       ) {
            formatNumberedList();
            console.log("set ol")
        }
        else if (event === "ul"
        //  && (currentlySelectedNode !== "ul" || "li")
         ) {
            formatBulletList();
            console.log("set ul")
        }

        else if (event === "formatParagraph" 
        // && currentlySelectedNode !== "paragraph"
        ) {
            console.log("format paragraph function running")
            console.log(event)
            formatParagraph();

        }


 
        // else if (event === "li" && (currentlySelectedNode !== "ul" || "li")) {
        //     // formatBulletList();
        //     console.log("set li")

        // }


    }




    const formatParagraph = () => {
        // console.log(blockType)
        // if (blockType !== "paragraph") {
            console.log("Running format paragraph function")
            editor.update(() => {
                const selection = $getSelection();
                if ($INTERNAL_isPointSelection(selection)) {
                  $setBlocksType(selection, () => $createParagraphNode());
                }
                          
                // if ($isRangeSelection(selection)) {
                //     console.log('is range selection')
                //     $setBlocksType(selection, () => $createParagraphNode());
                //     // $wrapNodes(selection, () => $createParagraphNode());
                // }
            });
        // }
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



    // if (editorRef.current) {
    //     editorRef.current.focus(); // Focus on the textarea element using the ref
    // }

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



// else if (event === "quote" && currentlySelectedNode !== "quote") {
//     // formatQuote();
//     console.log("set quote")

// }
// else if (event === "h1" && currentlySelectedNode !== "h1") {
//     // formatLargeHeading();
//     console.log("set h1")

// }
// else if (event === "h2" && currentlySelectedNode !== "h2") {
//     // formatMidHeading();
//     console.log("set h2")

// }
// else if (event === "h3" && currentlySelectedNode !== "h3") {
//     // formatSmallHeading();
//     console.log("set h3")

// }
// else if (event === "formatAlignLeft") {
//     // editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")
// } else if (event === "formatAlignCenter") {
//     // editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")
// } else if (event === "formatAlignRight") {
//     // editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")
// } else if (event === "formatAlignJustify") {
//     // editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
// }
    // else if (event === "formatInsertLink") {
    //     insertLink();
    // }
    // else if (event === "formatStrike") {
    //     editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
    // } 

// const formatQuote = () => {
//     if (blockType !== "quote") {
//         editor.update(() => {
//             const selection = $getSelection();

//             if ($isRangeSelection(selection)) {
//                 $wrapNodes(selection, () => $createQuoteNode());
//             }
//         });
//     }
// };
// const formatLargeHeading = () => {
//     if (blockType !== "h1") {
//         editor.update(() => {
//             const selection = $getSelection();

//             if ($isRangeSelection(selection)) {
//                 $wrapNodes(selection, () => $createHeadingNode("h1"));
//             }
//         });
//     }
// };


// const formatMidHeading = () => {
//     if (blockType !== "h2") {
//         editor.update(() => {
//             const selection = $getSelection();

//             if ($isRangeSelection(selection)) {
//                 $wrapNodes(selection, () => $createHeadingNode("h2"));
//             }
//         });
//     }
// };

// const formatSmallHeading = () => {
//     if (blockType !== "h3") {
//         editor.update(() => {
//             const selection = $getSelection();

//             if ($isRangeSelection(selection)) {
//                 $wrapNodes(selection, () => $createHeadingNode("h3"));
//             }
//         });
//     }
// };


    // const insertLink = useCallback(() => {
    //     if (!isLink) {
    //         editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    //     } else {
    //         editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    //     }
    // }, [editor, isLink]);

