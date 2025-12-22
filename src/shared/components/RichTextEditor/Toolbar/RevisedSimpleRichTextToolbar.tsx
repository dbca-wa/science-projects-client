// Toolbar for the simple rich text editor

import { useCallback, useEffect, useRef, useState } from "react";
import { InsertTableModal } from "@/shared/components/Modals/RTEModals/InsertTableModal";
import { FaBold, FaItalic, FaRedo, FaUnderline, FaUndo } from "react-icons/fa";
import { ImClearFormatting } from "react-icons/im";
import { MdSubscript, MdSuperscript } from "react-icons/md";
import { RevisedBaseToolbarButton } from "../Buttons/RevisedBaseToolbarButton";
import { VerticalDivider } from "./VerticalDivider";

import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import {
  // $INTERNAL_isPointSelection,
  $createParagraphNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
  type LexicalEditor,
  type NodeKey,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";

import { getSelectedNode } from "@/shared/utils/getSelectedNode";
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

// Import for ElementSelector
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
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

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
  keyof typeof blockTypeToBlockName,
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
    null,
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

interface ElementProps {
  buttonSize?: "sm" | "md" | "lg";
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
  buttonSize,
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
      | "quote",
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
      | "quote",
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
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateButtonWidth = () => {
      if (buttonRef.current) {
        const width = buttonRef.current.offsetWidth;
        setButtonWidth(width);
      }
    };

    updateButtonWidth(); // Get initial width

    window.addEventListener("resize", updateButtonWidth); // Update width on window resize

    return () => {
      window.removeEventListener("resize", updateButtonWidth); // Clean up for optimization
    };
  }, [buttonRef]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={buttonSize || "sm"}
          variant="ghost"
          className="mx-1 flex-1 tabIndex-[-1]"
          ref={buttonRef}
        >
          {blockTypeToBlockIcon(blockType)}
          <span className="ml-2">{blockTypeToBlockName(blockType)}</span>
          <FaCaretDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="z-[9999999999999] absolute"
        style={{ minWidth: "200px", width: buttonWidth }}
      >
        <DropdownMenuItem
          onClick={formatParagraph}
          className="w-full inline-flex items-center z-2"
        >
          <BsTextParagraph className="mr-4" />
          <span>Normal</span>
        </DropdownMenuItem>
        {allowInserts ? (
          <>
            <DropdownMenuItem
              onClick={formatBulletList}
              className="w-full inline-flex items-center z-2"
            >
              <MdFormatListBulleted className="mr-4" />
              <span>Bullet List</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={formatNumberList}
              className="w-full inline-flex items-center z-2"
            >
              <MdFormatListNumbered className="mr-4" />
              <span>Numbered List</span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface Props {
  buttonSize?: "sm" | "md" | "lg";
  allowInserts?: boolean;
  hideBold?: boolean;
  hideUnderline?: boolean;
}

export const RevisedSimpleRichTextToolbar = ({
  allowInserts,
  buttonSize,
  hideBold,
  hideUnderline,
}: Props) => {
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
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      // if ($INTERNAL_isPointSelection(selection))
      if (selection !== null) {
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

  return (
    <>
      <InsertTableModal
        isOpen={isAddTableOpen}
        activeEditor={editor}
        onClose={() => setIsAddTableOpen(false)}
      />

      <div className={`flex border-b border-border bg-background dark:bg-gray-900 rounded-t-[20px] ${buttonSize === "sm" ? "px-1 py-1" : "px-5 py-0.5"}`}>
        <RevisedBaseToolbarButton
          buttonSize={buttonSize}
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
          buttonSize={buttonSize}
          ariaLabel="Redo"
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
          {!hideBold && (
            <RevisedBaseToolbarButton
              buttonSize={buttonSize}
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
          )}
          <RevisedBaseToolbarButton
            buttonSize={buttonSize}
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
          {!hideUnderline && (
            <RevisedBaseToolbarButton
              buttonSize={buttonSize}
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
          )}
          <VerticalDivider />
        </>

        <ElementSelector
          buttonSize={buttonSize}
          formatBulletList={formatBulletList}
          formatNumberList={formatNumberedList}
          formatParagraph={formatParagraph}
          blockType={blockType}
          allowInserts={allowInserts}
        />

        <VerticalDivider />
        <>
          <RevisedBaseToolbarButton
            buttonSize={buttonSize}
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
            buttonSize={buttonSize}
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
            buttonSize={buttonSize}
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
                          textNode,
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
      </div>
    </>
  );
};



interface ElementProps {
  buttonSize?: "sm" | "md" | "lg";
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


