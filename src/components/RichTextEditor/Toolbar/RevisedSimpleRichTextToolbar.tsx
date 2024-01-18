// Toolbar for the simple rich text editor

import { Box, Flex, useColorMode, useDisclosure } from "@chakra-ui/react";

import { useCallback, useEffect, useState } from "react";
import { VerticalDivider } from "./VerticalDivider";
import { RevisedBaseToolbarButton } from "../Buttons/RevisedBaseToolbarButton";
import { ImClearFormatting } from "react-icons/im";
import { MdSubscript, MdSuperscript } from "react-icons/md";
import { FaBold, FaItalic, FaRedo, FaUnderline, FaUndo } from "react-icons/fa";
import { InsertTableModal } from "@/components/Modals/RTEModals/InsertTableModal";

import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $INTERNAL_isPointSelection,
  $createParagraphNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  NodeKey,
  REDO_COMMAND,
  UNDO_COMMAND,
  $isRootOrShadowRoot,
} from "lexical";
import {
  mergeRegister,
  $getNearestBlockElementAncestorOrThrow,
  $findMatchingParent,
  $getNearestNodeOfType,
} from "@lexical/utils";

import { getSelectedNode } from "@/lib/utils/getSelectedNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $setBlocksType } from "@lexical/selection";

import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";

import { $isCodeHighlightNode } from "@lexical/code";
import { $isHeadingNode } from "@lexical/rich-text";

interface ToolbarProps {
  editor: LexicalEditor;
}

const useToolbar = ({
  editor,
}: ToolbarProps): [
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  // boolean,
  boolean,
  keyof typeof blockTypeToBlockName
] => {
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
    null
  );
  // const [codeLanguage, setCodeLanguage] = useState<string>("");
  const blockTypeToBlockName = {
    bullet: "Bulleted List",
    check: "Check List",
    code: "Code Block",
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    h4: "Heading 4",
    h5: "Heading 5",
    h6: "Heading 6",
    number: "Numbered List",
    paragraph: "Normal",
    quote: "Quote",
  };
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>("paragraph");

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
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ""
      ) {
        setIsText($isTextNode(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, "");
      if (!selection.isCollapsed() && rawTextContent === "") {
        setIsText(false);
        return;
      }

      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        let element =
          anchorNode.getKey() === "root"
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
              ListNode
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
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener("selectionchange", updatePopup);
    return () => {
      document.removeEventListener("selectionchange", updatePopup);
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
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, updatePopup]);

  return [
    isBold,
    isItalic,
    isUnderline,
    isSubscript,
    isSuperscript,
    // isStrikethrough,
    canUndo,
    canRedo,
    blockType,
  ];
};

interface Props {
  allowInserts?: boolean;
}

export const RevisedSimpleRichTextToolbar = ({ allowInserts }: Props) => {
  const [editor] = useLexicalComposerContext();
  const [
    isBold,
    isItalic,
    isUnderline,
    isSubscript,
    isSuperscript,
    // isStrikethrough,
    canUndo,
    canRedo,
    blockType,
  ] = useToolbar({ editor });
  const {
    isOpen: isAddTableOpen,
    onClose: onAddTableClose,
    // onOpen: onAddTableOpen,
  } = useDisclosure();

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($INTERNAL_isPointSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const { colorMode } = useColorMode();

  return (
    <>
      <InsertTableModal
        isOpen={isAddTableOpen}
        activeEditor={editor}
        onClose={onAddTableClose}
      />

      <Flex
        px={5}
        py={0.5}
        bg={colorMode === "light" ? undefined : "gray.900"}
        borderBottom={"1px solid"}
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      >
        <RevisedBaseToolbarButton
          ariaLabel="Undo"
          // isActive={isBold}
          variant={"ghost"}
          isDisabled={!canUndo}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
        >
          <FaUndo />
        </RevisedBaseToolbarButton>
        <RevisedBaseToolbarButton
          ariaLabel="Undo"
          // isActive={isBold}
          variant={"ghost"}
          isDisabled={!canRedo}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined);
          }}
        >
          <FaRedo />
        </RevisedBaseToolbarButton>
        <VerticalDivider />

        <>
          <RevisedBaseToolbarButton
            ariaLabel="Format text as Bold"
            isActive={isBold}
            variant={"ghost"}
            isDisabled={false}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
          >
            <FaBold />
          </RevisedBaseToolbarButton>
          <RevisedBaseToolbarButton
            ariaLabel="Format text as Italic"
            isActive={isItalic}
            variant={"ghost"}
            isDisabled={false}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
          >
            <FaItalic />
          </RevisedBaseToolbarButton>
          <RevisedBaseToolbarButton
            ariaLabel="Format text as Underlined"
            isActive={isUnderline}
            variant={"ghost"}
            isDisabled={false}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
          >
            <FaUnderline />
          </RevisedBaseToolbarButton>
          <VerticalDivider />
        </>

        <ElementSelector
          formatBulletList={formatBulletList}
          formatNumberList={formatNumberedList}
          formatParagraph={formatParagraph}
          blockType={blockType}
          allowInserts={allowInserts}
        />

        <VerticalDivider />
        <>
          <RevisedBaseToolbarButton
            ariaLabel="Format Subscript"
            isActive={isSubscript}
            variant={"ghost"}
            isDisabled={false}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
            }}
          >
            <MdSubscript />
          </RevisedBaseToolbarButton>
          <RevisedBaseToolbarButton
            ariaLabel="Format Superscript"
            isActive={isSuperscript}
            variant={"ghost"}
            isDisabled={false}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
            }}
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

                  if (
                    anchor.key === focus.key &&
                    anchor.offset === focus.offset
                  ) {
                    return;
                  }

                  // Iterate4 over each node
                  nodes.forEach((node, index) => {
                    if ($isTextNode(node)) {
                      let textNode = node;
                      if (index === 0 && anchor.offset !== 0) {
                        textNode =
                          textNode.splitText(anchor.offset)[1] || textNode;
                      }
                      if (index === nodes.length - 1) {
                        textNode =
                          textNode.splitText(focus.offset)[0] || textNode;
                      }

                      if (textNode.__style !== "") {
                        textNode.setStyle("");
                      }

                      if (textNode.__format !== 0) {
                        textNode.setFormat(0);
                        $getNearestBlockElementAncestorOrThrow(
                          textNode
                        ).setFormat("");
                      }
                      node = textNode;
                    }
                    // Potentially unused in SPMS as we are not allowing heading/quite/decor nodes
                    // else if ($isHeadingNode(node) || $isQuoteNode(node)) {
                    //     node.replace($createParagraphNode(), true);
                    // } else if ($isDecoratorBlockNode(node)) {
                    //     node.setFormat('');
                    // }
                  });
                }
              });
            }}
          >
            <ImClearFormatting />
          </RevisedBaseToolbarButton>
        </>
      </Flex>
    </>
  );
};

import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { useRef } from "react";
import { BsChatSquareQuoteFill, BsTextParagraph } from "react-icons/bs";
import { FaCaretDown, FaCode } from "react-icons/fa";
import {
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuHeading4,
  LuHeading5,
  LuHeading6,
} from "react-icons/lu";
import { MdFormatListBulleted, MdFormatListNumbered } from "react-icons/md";
import { TbChecklist } from "react-icons/tb";

interface ElementProps {
  formatParagraph: () => void;
  formatBulletList: () => void;
  formatNumberList: () => void;
  blockType:
    | "number"
    | "code"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "bullet"
    | "check"
    | "paragraph"
    | "quote";
  allowInserts: boolean;
}

const ElementSelector = ({
  formatParagraph,
  formatBulletList,
  formatNumberList,
  blockType,
  allowInserts,
}: ElementProps) => {
  // blockType: "number" | "code" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "bullet" | "check" | "paragraph" | "quote"

  const blockTypeToBlockName = (
    blockType:
      | "number"
      | "code"
      | "h1"
      | "h2"
      | "h3"
      | "h4"
      | "h5"
      | "h6"
      | "bullet"
      | "check"
      | "paragraph"
      | "quote"
  ) => {
    const dict = {
      code: "Code",
      h1: "Heading 1",
      h2: "Heading 2",
      h3: "Heading 3",
      h4: "Heading 4",
      h5: "Heading 5",
      h6: "Heading 6",
      number: "Numbered List",
      bullet: "Bullet List",
      check: "Check List",
      paragraph: "Normal",
      quote: "Quote",
    };
    return dict[blockType];
  };

  const blockTypeToBlockIcon = (
    blockType:
      | "number"
      | "code"
      | "h1"
      | "h2"
      | "h3"
      | "h4"
      | "h5"
      | "h6"
      | "bullet"
      | "check"
      | "paragraph"
      | "quote"
  ) => {
    const dict = {
      code: <FaCode />,
      h1: <LuHeading1 />,
      h2: <LuHeading2 />,
      h3: <LuHeading3 />,
      h4: <LuHeading4 />,
      h5: <LuHeading5 />,
      h6: <LuHeading6 />,
      number: <MdFormatListNumbered />,
      bullet: <MdFormatListBulleted />,
      check: <TbChecklist />,
      paragraph: <BsTextParagraph />,
      quote: <BsChatSquareQuoteFill />,
    };
    return dict[blockType];
  };

  const [buttonWidth, setButtonWidth] = useState(0);
  const buttonRef = useRef(null);

  useEffect(() => {
    const updateButtonWidth = () => {
      if (buttonRef.current) {
        // eslint-disable-next-line
        // @ts-ignore
        const width = buttonRef.current.offsetWidth;
        setButtonWidth(width);
      }
    };

    updateButtonWidth(); // Get initial width

    window.addEventListener("resize", updateButtonWidth); // Update width on window resize

    return () => {
      window.removeEventListener("resize", updateButtonWidth); // Clean up for optomisation
    };
  }, [buttonRef]);

  return (
    <Menu
      isLazy
      // placement="bottom"
    >
      <MenuButton
        as={Button}
        variant={"ghost"}
        leftIcon={blockTypeToBlockIcon(blockType)}
        rightIcon={<FaCaretDown />}
        // px={8}
        mx={1}
        flex={1}
        tabIndex={-1}
      >
        {blockTypeToBlockName(blockType)}
      </MenuButton>
      <MenuList
        // minW={"200px"}
        zIndex={9999999999999}
        w={buttonWidth}
        minW={"200px"}
        pos={"absolute"}
        // right={-500}
      >
        <MenuItem
          onClick={formatParagraph}
          // w={"100%"}
          display={"inline-flex"}
          alignItems={"center"}
          zIndex={2}
        >
          <BsTextParagraph />

          <Box pl={4} zIndex={2}>
            <span>Normal</span>
          </Box>
        </MenuItem>
        {allowInserts ? (
          <>
            <MenuItem
              onClick={formatBulletList}
              w={"100%"}
              display={"inline-flex"}
              alignItems={"center"}
              zIndex={2}
            >
              <MdFormatListBulleted />

              <Box pl={4} zIndex={2}>
                <span>Bullet List</span>
              </Box>
            </MenuItem>
            <MenuItem
              onClick={formatNumberList}
              w={"100%"}
              display={"inline-flex"}
              alignItems={"center"}
              zIndex={2}
            >
              <MdFormatListNumbered />

              <Box pl={4} zIndex={2}>
                <span>Numbered List</span>
              </Box>
            </MenuItem>
          </>
        ) : null}
      </MenuList>
    </Menu>
  );
};
