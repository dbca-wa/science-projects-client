// Toolbar for the simple rich text editor

import {
    Box,
    Divider,
    Flex,
    useBreakpointValue,
    useColorMode,
    useDisclosure,
  } from "@chakra-ui/react";
  
  
  // import { AlignButton } from "../MenuButtons/AlignButton"
  import { RefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
  import { useToolbarClickListener } from "../../../lib/hooks/useToolbarClickListener";
  import { TimeButtons } from "./TimeButtons";
  import { ElementTypeButton } from "../MenuButtons/ElementTypeButton";
  import { BoldButton } from "../Buttons/BoldButton";
  import { VerticalDivider } from "./VerticalDivider";
  import { InsertItemMenuButton } from "../MenuButtons/InsertItemMenuButton";
  import { ItalicsButton } from "../Buttons/ItalicsButton";
  import { UnderlineButton } from "../Buttons/UnderlineButton";
  import { FontFormatterButton } from "../MenuButtons/FontFormatterButton";
  import { ToolbarToggleBtn } from "../Buttons/ToolbarToggleBtn";
import { RevisedBaseToolbarButton } from "../Buttons/RevisedBaseToolbarButton";
import { ImClearFormatting } from "react-icons/im";
import { MdSubscript, MdSuperscript } from "react-icons/md";
import { FaBold, FaItalic, FaRedo, FaUnderline, FaUndo } from "react-icons/fa";
import { InsertTableModal } from "@/components/Modals/RTEModals/InsertTableModal";

  import { CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_CRITICAL, $INTERNAL_isPointSelection, $createParagraphNode, $getSelection, $isParagraphNode, $isRangeSelection, $isTextNode, COMMAND_PRIORITY_LOW, FORMAT_TEXT_COMMAND, LexicalEditor, NodeKey, REDO_COMMAND, SELECTION_CHANGE_COMMAND, UNDO_COMMAND, $isRootOrShadowRoot } from "lexical";
  import { mergeRegister, $getNearestBlockElementAncestorOrThrow,  $findMatchingParent, $getNearestNodeOfType} from '@lexical/utils';
  
import { getDOMRangeRect } from "@/lib/utils/getDOMRangeRect";
import { setFloatingElemPosition } from "@/lib/utils/setFloatingElemPosition";
import { getSelectedNode } from "@/lib/utils/getSelectedNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
  import {
    $getSelectionStyleValueForProperty,
    $isParentElementRTL,
    $patchStyleText,
    $setBlocksType,
  } from '@lexical/selection';

import {
    $isListNode,
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    ListNode,
    REMOVE_LIST_COMMAND,
  } from '@lexical/list';
  

  import {
    $createCodeNode,
    $isCodeNode,
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
    CODE_LANGUAGE_MAP,
    getLanguageFriendlyName,
    $isCodeHighlightNode
  } from '@lexical/code';
  import {
    $createHeadingNode,
    $createQuoteNode,
    $isHeadingNode,
    $isQuoteNode,
    HeadingTagType,
  } from '@lexical/rich-text';

interface ToolbarProps {
    editor: LexicalEditor;
}

const useToolbar = (
    {editor}: ToolbarProps
    ) => {
    const [isText, setIsText] = useState<boolean>(false);
    // const [isLink, setIsLink] = useState(false);
    const [isBold, setIsBold] = useState<boolean>(false);
    const [isItalic, setIsItalic] = useState<boolean>(false);
    const [isUnderline, setIsUnderline] = useState<boolean>(false);
    const [isSubscript, setIsSubscript] = useState<boolean>(false);
    const [isSuperscript, setIsSuperscript] = useState<boolean>(false);
    const [isStrikethrough, setIsStrikethrough] = useState<boolean>(false);
    const [canUndo, setCanUndo] = useState<boolean>(false);
    const [canRedo, setCanRedo] = useState<boolean>(false);
    const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
        null,
      );
      const [codeLanguage, setCodeLanguage] = useState<string>('');
    const [blockType, setBlockType] =
      useState<keyof typeof blockTypeToBlockName>('paragraph');

      
    const updatePopup = useCallback(() => {
        editor.getEditorState().read(() => {
            // Should not to pop up the floating toolbar when using IME input
            if (editor.isComposing()) {
                return;
            }
            const selection = $getSelection();
            const nativeSelection = window.getSelection();
            const rootElement = editor.getRootElement();

            if (
                nativeSelection !== null &&
                (!$isRangeSelection(selection) ||
                    rootElement === null ||
                    !rootElement.contains(nativeSelection.anchorNode))
            ) {
                setIsText(false);
                return;
            }

            if (!$isRangeSelection(selection)) {
                return;
            }

            const node = getSelectedNode(selection);

            // Update text format
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsSubscript(selection.hasFormat('subscript'));
            setIsSuperscript(selection.hasFormat('superscript'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));

            if (
                !$isCodeHighlightNode(selection.anchor.getNode()) &&
                selection.getTextContent() !== ''
            ) {
                setIsText($isTextNode(node) || $isParagraphNode(node));
            } else {
                setIsText(false);
            }

            const rawTextContent = selection.getTextContent().replace(/\n/g, '');
            if (!selection.isCollapsed() && rawTextContent === '') {
                setIsText(false);
                return;
            }
        });
    }, [editor]);

    useEffect(() => {
        document.addEventListener('selectionchange', updatePopup);
        return () => {
            document.removeEventListener('selectionchange', updatePopup);
        };
    }, [updatePopup]);

    useEffect(() => {
       
    
        return mergeRegister(
            editor.registerUpdateListener(() => {
                updatePopup();
            }),
            editor.registerRootListener(() => {
                if (editor.getRootElement() === null) {
                    setIsText(false);
                }
            }),
            editor.registerCommand<boolean>(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            editor.registerCommand<boolean>(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),

        );
    }, [editor, updatePopup]);

        
    const blockTypeToBlockName = {
        bullet: 'Bulleted List',
        check: 'Check List',
        code: 'Code Block',
        h1: 'Heading 1',
        h2: 'Heading 2',
        h3: 'Heading 3',
        h4: 'Heading 4',
        h5: 'Heading 5',
        h6: 'Heading 6',
        number: 'Numbered List',
        paragraph: 'Normal',
        quote: 'Quote',
    };


    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);


    if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        //   if ($isCodeNode(element)) {
        //     const language =
        //       element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
        //     setCodeLanguage(
        //       language ? CODE_LANGUAGE_MAP[language] || language : '',
        //     );
        //     return;
        //   }
        }
      }
    }

    return [isBold, isItalic, isUnderline, isSubscript, isSuperscript, isStrikethrough, canUndo, canRedo, blockType]
}

  interface Props {
    anchorElem?: HTMLElement;
  }
  
  export const RevisedRichTextToolbar = ({
    anchorElem,
  }: Props) => {
    const [editor] = useLexicalComposerContext();
    const [isBold, isItalic, isUnderline, isSubscript, isSuperscript, isStrikethrough, canUndo, canRedo, blockType] = useToolbar({editor});
    const { isOpen: isAddTableOpen, onClose: onAddTableClose, onOpen: onAddTableOpen } = useDisclosure();

    // const formatParagraph = () => {
    //     editor.update(() => {
    //       const selection = $getSelection();
    //       if ($INTERNAL_isPointSelection(selection)) {
    //         $setBlocksType(selection, () => $createParagraphNode());
    //       }
    //     });
    //   };
    
    //   const formatBulletList = () => {
    //     if (blockType !== 'bullet') {
    //       editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    //     } else {
    //       editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    //     }
    //   };
    
    //   const formatNumberedList = () => {
    //     if (blockType !== 'number') {
    //       editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    //     } else {
    //       editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    //     }
    //   };
    
    

    return (
        <>
                            <InsertTableModal isOpen={isAddTableOpen} activeEditor={editor} onClose={onAddTableClose} />

      <Flex>
        <RevisedBaseToolbarButton
                                ariaLabel="Undo"
                                // isActive={isBold}
                                variant={"ghost"}
                                isDisabled={!canUndo}
                                onClick={() => {             editor.dispatchCommand(UNDO_COMMAND, undefined);
                                }}
        
        >
        <FaUndo />
        </RevisedBaseToolbarButton>
        <RevisedBaseToolbarButton
                                ariaLabel="Undo"
                                // isActive={isBold}
                                variant={"ghost"}
                                isDisabled={!canRedo}
                                onClick={() => {             editor.dispatchCommand(REDO_COMMAND, undefined);
                                }}
        
        >
        <FaRedo />
        </RevisedBaseToolbarButton>
<VerticalDivider/>
                    <RevisedBaseToolbarButton
                        ariaLabel="Format text as Bold"
                        isActive={isBold}
                        variant={"ghost"}
                        isDisabled={false}
                        onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold') }}
                    >
                        <FaBold />

                    </RevisedBaseToolbarButton>
                    <RevisedBaseToolbarButton
                        ariaLabel="Format text as Italic"
                        isActive={isItalic}
                        variant={"ghost"}
                        isDisabled={false}
                        onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic') }}
                    >
                        <FaItalic />
                    </RevisedBaseToolbarButton>
                    <RevisedBaseToolbarButton
                        ariaLabel="Format text as Underlined"
                        isActive={isUnderline}
                        variant={"ghost"}
                        isDisabled={false}
                        onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline') }}
                    >
                        <FaUnderline />
                    </RevisedBaseToolbarButton>
                    <VerticalDivider />

                    {/* <RevisedBaseToolbarButton
                        ariaLabel="Format text with a strikethrough"
                        isActive={isStrikethrough}
                        variant={"ghost"}
                        isDisabled={false}
                        onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough') }}
                    >
                        Strike
                    </RevisedBaseToolbarButton> */}
                    <RevisedBaseToolbarButton
                        ariaLabel="Format Subscript"
                        isActive={isSubscript}
                        variant={"ghost"}
                        isDisabled={false}
                        onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript') }}
                    >
                        <MdSubscript />
                    </RevisedBaseToolbarButton>
                    <RevisedBaseToolbarButton
                        ariaLabel="Format Superscript"
                        isActive={isSuperscript}
                        variant={"ghost"}
                        isDisabled={false}
                        onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript') }}
                    >
                        <MdSuperscript />
                    </RevisedBaseToolbarButton>
                    <RevisedBaseToolbarButton
                        ariaLabel="Clear Formatting"
                        variant={"ghost"}
                        isDisabled={false}
                        onClick={() => {
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
                                        if ($isTextNode(node)) {
                                            let textNode = node;
                                            if (index === 0 && anchor.offset !== 0) {
                                                textNode = textNode.splitText(anchor.offset)[1] || textNode;
                                            }
                                            if (index === nodes.length - 1) {
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
                        }}
                    >
                        <ImClearFormatting />
                    </RevisedBaseToolbarButton>
                    <VerticalDivider/>
                    <RevisedBaseToolbarButton
                        ariaLabel="Insert Table"
                        // isActive={isSuperscript}
                        variant={"ghost"}
                        isDisabled={false}
                        onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript') }}
                    >
                        <MdSuperscript />
                    </RevisedBaseToolbarButton>

      </Flex>
</>
    );
  };
  



  
        // {/* <AutoFocusPlugin clickFunction={onClick} /> */}
        // <Flex
        //   width={"100%"}
        //   // my={1}
        //   px={1}
        //   backgroundColor={
        //     colorMode === "light" ? "whiteAlpha.800" : "blackAlpha.400"
        //   }
        //   overflowX={"hidden"}
        //   justifyContent={"space-between"}
        //   display={"flex"}
        // >
        //   {isSmall ? (
        //     <>
        //       <TimeButtons onClick={onClick} editor={editor} />
        //       <VerticalDivider />
        //       {currentToolbarPage === 1 ? (
        //         <>
        //           <BoldButton
        //             onClick={onClick}
        //             editor={editor}
        //             buttonIsOn={selectedIsBold}
        //           />
        //           <ItalicsButton onClick={onClick} editor={editor} />
        //           <UnderlineButton onClick={onClick} editor={editor} />
        //           {/* <FontHighlighterButton /> */}
        //           <VerticalDivider />
        //         </>
        //       ) : currentToolbarPage === 2 ? (
        //         <>
        //           {/* <ElementTypeButton
        //                                               onClick={onClick}
        //                                               selectedNodeType={selectedNodeType}
        //                                               editor={editor}
        //                                               isSmall
        //                                           // currentlyClickedNode={selectedNodeType}
        //                                           // setCurrentlyClickedNode={setSelectedNodeType}
        //                                           /> */}
        //           <>
        //             <FontFormatterButton onClick={onClick} />
        //             {/* <AlignButton isSmall onClick={onClick} /> */}
        //           </>
        //           <VerticalDivider />
        //         </>
        //       ) : (
        //         <>
        //           <InsertItemMenuButton onClick={onClick} />
  
        //           <VerticalDivider />
        //         </>
        //       )}
  
        //       <Box>
        //         <ToolbarToggleBtn
        //           page={currentToolbarPage}
        //           setPage={setCurrentToolbarPage}
        //           maxPages={3}
        //           isSmall
        //         />
        //       </Box>
        //     </>
        //   ) : shouldShowToolbarToggleBtnWhenNotSmall ? (
        //     <>
        //       <TimeButtons onClick={onClick} editor={editor} />
        //       <VerticalDivider />
        //       {currentToolbarPageMd === 1 ? (
        //         <>
        //           {/* <FontStylingButtons /> */}
  
        //           <BoldButton
        //             onClick={onClick}
        //             editor={editor}
        //             buttonIsOn={selectedIsBold}
        //           />
  
        //           <ItalicsButton onClick={onClick} editor={editor} />
        //           <UnderlineButton onClick={onClick} editor={editor} />
        //           <VerticalDivider />
        //         </>
        //       ) : currentToolbarPageMd === 2 ? (
        //         <>
        //           <ElementTypeButton
        //             onClick={onClick}
        //             selectedNodeType={selectedNodeType}
        //             editor={editor}
        //             isSmall
        //             // currentlyClickedNode={selectedNodeType}
        //             // setCurrentlyClickedNode={setSelectedNodeType}
        //           />
        //           <VerticalDivider />
  
        //           {/* <VerticalDivider /> */}
  
        //           <>
        //             <FontFormatterButton onClick={onClick} />
        //             <VerticalDivider />
  
        //             {/* <AlignButton onClick={onClick} /> */}
        //           </>
        //         </>
        //       ) : (
        //         <>
        //           <InsertItemMenuButton onClick={onClick} />
        //           <VerticalDivider />
        //         </>
        //       )}
        //       <ToolbarToggleBtn
        //         page={currentToolbarPageMd}
        //         setPage={setCurrentToolbarPageMd}
        //         maxPages={3}
        //         isSmall
        //       />
        //     </>
        //   ) : (
        //     <>
        //       <TimeButtons onClick={onClick} editor={editor} />
        //       <VerticalDivider />
        //       <BoldButton
        //         onClick={onClick}
        //         editor={editor}
        //         buttonIsOn={selectedIsBold}
        //       />
        //       <ItalicsButton onClick={onClick} editor={editor} />
        //       <UnderlineButton onClick={onClick} editor={editor} />
        //       <VerticalDivider />
  
        //       <ElementTypeButton
        //         onClick={onClick}
        //         selectedNodeType={selectedNodeType}
        //         editor={editor}
        //         isSmall
        //         shouldFurtherConcat={true}
  
        //         // currentlyClickedNode={selectedNodeType}
        //         // setCurrentlyClickedNode={setSelectedNodeType}
        //       />
        //       <VerticalDivider />
        //       <FontFormatterButton onClick={onClick} />
  
        //       <VerticalDivider />
        //       <InsertItemMenuButton onClick={onClick} />
        //     </>
        //   )}
        // </Flex>
        // <Divider />

























  // const [editor] = useLexicalComposerContext();
  
  // const [isText, setIsText] = useState(false);
  // const [selectedIsBold, setSelectedIsBold] = useState(false);
  // const [selectedIsItalic, setSelectedIsItalic] = useState(false);
  // const [selectedIsUnderlined, setSelectedIsUnderlined] = useState(false);
  // const [selectedIsSubscript, setSelectedIsSubscript] = useState(false);
  // const [selectedIsSuperscript, setSelectedIsSuperscript] = useState(false);
  
  // useEffect(() => {
  //   editor.getEditorState().read(() => {
  //     const selection = $getSelection();
  //     const nativeSelection = window.getSelection();
  //     const rootElement = editor.getRootElement();
  
  //     if (
  //       nativeSelection !== null &&
  //       (!$isRangeSelection(selection) ||
  //         rootElement === null ||
  //         !rootElement.contains(nativeSelection.anchorNode))
  //     ) {
  //       setIsText(false);
  //       return;
  //     }
  
  //     if (!$isRangeSelection(selection)) {
  //       return;
  //     }
  //     setSelectedIsBold(selection.hasFormat("bold"));
  //     setSelectedIsItalic(selection.hasFormat("italic"));
  //     setSelectedIsUnderlined(selection.hasFormat("underline"));
  //     setSelectedIsSubscript(selection.hasFormat("subscript"));
  //     setSelectedIsSuperscript(selection.hasFormat("superscript"));
  
  //     // setIsStrikethrough(selection.hasFormat('strikethrough'));
  //     // setIsCode(selection.hasFormat('code'));
  //   });
  // }, [editor]);
  
  // useEffect(() => {
  //   console.log({
  //     selectedIsBold,
  //     selectedIsItalic,
  //     selectedIsUnderlined,
  //     selectedIsSubscript,
  //     selectedIsSuperscript,
  //   });
  // });
  