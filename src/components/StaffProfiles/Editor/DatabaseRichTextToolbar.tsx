// Toolbar for the simple rich text editor

import { Box, Flex, FlexProps, Text, useDisclosure } from "@chakra-ui/react";

import { InsertTableModal } from "@/components/Modals/RTEModals/InsertTableModal";
import { VerticalDivider } from "@/components/RichTextEditor/Toolbar/VerticalDivider";
import { ToolbarButton } from "@/components/StaffProfiles/Editor/ToolbarButton";
import { MutableRefObject, useCallback, useEffect, useState } from "react";
import { FaBold, FaItalic, FaRedo, FaUnderline, FaUndo } from "react-icons/fa";
import { ImClearFormatting } from "react-icons/im";
import { MdSubscript, MdSuperscript } from "react-icons/md";
import "./staffprofileeditor.css";

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
  LexicalEditor,
  NodeKey,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";

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

interface Props extends FlexProps {
  allowInserts?: boolean;
  allowTable?: boolean;
  referenceFlex: MutableRefObject<HTMLDivElement>;
}

export const DatabaseRichTextToolbar = ({
  allowInserts,
  allowTable,
  referenceFlex,
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
  const {
    isOpen: isAddTableOpen,
    onClose: onAddTableClose,
    // onOpen: onAddTableOpen,
  } = useDisclosure();

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
        onClose={onAddTableClose}
      />

      <Flex
        flexWrap="wrap" // This allows the toolbar buttons to wrap to the next line
        justifyContent="flex-start" // Align items to the start
        gap="8px" // Adds spacing between items
        bg={"gray.900"}
        roundedTop={6}
        px={1}
        py={1}
        boxShadow="4px 0px 4px rgba(0,0,0,0.2), -4px 0px -4px rgba(0,0,0,0.2)"
        ref={referenceFlex}
      >
        <ToolbarButton
          ariaLabel="Undo"
          variant={"ghost"}
          isDisabled={!canUndo}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
        >
          <FaUndo size={"12px"} color={"white"} />
        </ToolbarButton>
        <ToolbarButton
          ariaLabel="Redo"
          variant={"ghost"}
          isDisabled={!canRedo}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined);
          }}
        >
          <FaRedo size={"12px"} color={"white"} />
        </ToolbarButton>
        <VerticalDivider />

        <>
          <ToolbarButton
            ariaLabel="Format text as Bold"
            isActive={isBold}
            variant={"ghost"}
            isDisabled={false}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
          >
            <FaBold size={"12px"} color={"white"} />
          </ToolbarButton>
          <ToolbarButton
            ariaLabel="Format text as Italic"
            isActive={isItalic}
            variant={"ghost"}
            isDisabled={false}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
          >
            <FaItalic size={"12px"} color={"white"} />
          </ToolbarButton>
          <ToolbarButton
            ariaLabel="Format text as Underlined"
            isActive={isUnderline}
            variant={"ghost"}
            isDisabled={false}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
          >
            <FaUnderline size={"12px"} color={"white"} />
          </ToolbarButton>
          <ToolbarButton
            ariaLabel="Format Subscript"
            isActive={isSubscript}
            variant={"ghost"}
            isDisabled={false}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
            }}
          >
            <MdSubscript size={"12px"} color={"white"} />
          </ToolbarButton>
          <ToolbarButton
            ariaLabel="Format Superscript"
            isActive={isSuperscript}
            variant={"ghost"}
            isDisabled={false}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
            }}
          >
            <MdSuperscript size={"12px"} color={"white"} />
          </ToolbarButton>
          <ToolbarButton
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
            <ImClearFormatting size={"12px"} color={"white"} />
          </ToolbarButton>
        </>

        {/* <VerticalDivider /> */}
        <ElementSelector
          buttonSize={"sm"}
          formatBulletList={formatBulletList}
          formatNumberList={formatNumberedList}
          formatParagraph={formatParagraph}
          blockType={blockType}
          allowInserts={allowInserts}
        />

        {allowTable ? <TableDropdown activeEditor={editor} /> : null}
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
      code: <FaCode size={"12px"} />,
      h1: <LuHeading1 size={"12px"} />,
      h2: <LuHeading2 size={"12px"} />,
      h3: <LuHeading3 size={"12px"} />,
      h4: <LuHeading4 size={"12px"} />,
      h5: <LuHeading5 size={"12px"} />,
      h6: <LuHeading6 size={"12px"} />,
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
      {" "}
      <Box className="tooltip-container flex-grow">
        <MenuButton
          as={Button}
          variant={"ghost"}
          size={buttonSize}
          leftIcon={blockTypeToBlockIcon(blockType)}
          rightIcon={<FaCaretDown />}
          flex="1 1 auto" // Ensures the button can grow and shrink as needed
          whiteSpace="nowrap" // Prevents text from wrapping within the button itself
          overflow="hidden" // Hides any overflow content
          textOverflow="ellipsis" // Adds ellipsis if text overflows
          mx={1}
          ref={buttonRef}
          w={"100%"}
          // // px={8}
          // mx={1}
          // flex={1}
          // tabIndex={-1}
          color={"white"}
          bg={"gray.900"}
          _hover={{ bg: "gray.600" }}
          _active={{ bg: "gray.600" }}
          _selected={{ bg: "gray.600" }}
          _expanded={{ bg: "gray.600" }}
        >
          {/* {buttonSize} */}
          {blockTypeToBlockName(blockType)}
        </MenuButton>
        <MenuList
          // minW={"200px"}
          zIndex={9999999999999}
          w={buttonWidth}
          minW={"200px"}
          pos={"absolute"}
          // right={-500}
          bg={"white"}
        >
          <MenuItem
            onClick={formatParagraph}
            // w={"100%"}
            display={"inline-flex"}
            alignItems={"center"}
            zIndex={2}
            bg={"white"}
            _hover={{
              bg: "gray.100",
            }}
            color={"black"}
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
                bg={"white"}
                _hover={{
                  bg: "gray.100",
                }}
                color={"black"}
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
                bg={"white"}
                _hover={{
                  bg: "gray.100",
                }}
                color={"black"}
              >
                <MdFormatListNumbered />

                <Box pl={4} zIndex={2}>
                  <span>Numbered List</span>
                </Box>
              </MenuItem>
            </>
          ) : null}
        </MenuList>
        <Text className="tooltip-text">Select Type</Text>
      </Box>
    </Menu>
  );
};

// A template for a RTE simple button - props fill out its icon, text and functionality

import { Center, Grid, useColorMode } from "@chakra-ui/react";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { FaTable } from "react-icons/fa";
import "../../../styles/texteditor.css";

interface TableGridProps {
  activeEditor: LexicalEditor;
}

const TableGrid = ({ activeEditor }: TableGridProps) => {
  const [tableRows, setTableRows] = useState(0);
  const [tableColumns, setTableColumns] = useState(0);
  // const [isDisabled, setIsDisabled] = useState(true);

  const onGridClick = () => {
    activeEditor.update(() => {
      const columns: string = String(tableColumns);
      const rows: string = String(tableRows);

      // Check if the selected node is within a table cell
      const selection = $getSelection();
      const selectedNode = selection?.getNodes()[0];
      if (
        selectedNode &&
        selectedNode.getType() !== "root" &&
        selectedNode.getParentOrThrow().getType() === "tablecell"
      ) {
        alert("You cannot insert a table within a table cell.");
        return;
      }
      if (selectedNode.getType() !== "root") {
        // console.log(selectedNode.getParentOrThrow().getType());
      } else {
        // console.log("rootnode");
      }

      activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
        columns: columns,
        rows: rows,
      });
    });
  };

  // const { colorMode } = useColorMode();

  const handleMouseEnter = (row: number, column: number) => {
    setTableRows(row + 1);
    setTableColumns(column + 1);
  };

  const createGrid = () => {
    const rows = 11; // Define the maximum rows
    const columns = 7; // Define the maximum columns
    const grid = [];

    for (let row = 0; row < rows; row++) {
      const cols = [];
      for (let col = 0; col < columns; col++) {
        const isHighlighted = row < tableRows && col < tableColumns;
        const isFirstRowOrColumn = row === 0 || col === 0;
        cols.push(
          <Box
            key={`${row}-${col}`}
            w="25px"
            h="25px"
            border="1px solid"
            borderColor={
              isHighlighted
                ? // ? colorMode === "light"
                  "gray.300"
                : // : "gray.300"
                  // : colorMode === "light"
                  // ?
                  "gray.300"
              //   : "gray.400"
            }
            onMouseEnter={() => handleMouseEnter(row, col)}
            onClick={onGridClick}
            // backgroundColor={row < tableRows && col < tableColumns ? 'blue.300' : 'white'}
            backgroundColor={
              // colorMode === "light"
              //   ?
              isFirstRowOrColumn
                ? isHighlighted
                  ? "blue.300"
                  : "gray.200"
                : isHighlighted
                  ? "blue.200"
                  : "white"
              // : isFirstRowOrColumn
              //   ? isHighlighted
              //     ? "blue.400"
              //     : "gray.300"
              //   : isHighlighted
              //     ? "blue.300"
              //     : "white"
            }
            _hover={{
              backgroundColor:
                // colorMode === "light" ?
                isFirstRowOrColumn ? "blue.400" : "green.100",
              // : isFirstRowOrColumn
              //   ? "blue.500"
              //   : "green.200",
            }}
          />,
        );
      }
      grid.push(
        <Grid templateColumns={`repeat(${columns}, 1fr)`} key={row}>
          {cols}
        </Grid>,
      );
    }
    return grid;
  };

  return (
    <Center display={"flex"} flexDir={"column"} w={"100%"}>
      {/* Table amount */}
      <Text fontSize={"large"} pb={2}>
        {tableColumns} x {tableRows} table
      </Text>
      {/* Table grid */}
      <Box
      // display={"flex"}
      // flexDir={"column"}
      // w={"100%"}
      >
        {createGrid()}
      </Box>
    </Center>
  );
};

const TableDropdown = ({ activeEditor }: TableGridProps) => {
  return (
    <BaseToolbarMenuButton
      menuIcon={FaTable}
      disableHoverBackground
      title="Table"
      menuItems={[
        {
          component: <TableGrid activeEditor={activeEditor} />,
        },
      ]}
    />
  );
};

// A template for a RTE menu button - props fill out its icon, text and functionality

import { Icon } from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons";

interface IMenuItem {
  leftIcon?: IconType;
  text?: string;
  component?: React.ReactNode;
  onClick?: () => void;
}

export interface IBaseToolbarMenuButtonProps {
  title?: string;
  menuIcon?: IconType;
  menuItems: IMenuItem[];
  onClick?: () => void;
  disableHoverBackground?: boolean;
}

export const BaseToolbarMenuButton = ({
  title,
  menuIcon: MenuIcon,
  menuItems,
  onClick,
  disableHoverBackground,
}: IBaseToolbarMenuButtonProps) => {
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

  // const { colorMode } = useColorMode();

  return (
    <Menu isLazy>
      <MenuButton
        as={Button}
        variant={"ghost"}
        leftIcon={MenuIcon ? <MenuIcon /> : undefined}
        rightIcon={<FaCaretDown />}
        // px={8}
        mx={1}
        flex={1}
        ref={buttonRef}
        tabIndex={-1}
        onClick={() => onClick?.()}
        color={"white"}
        _active={{ bg: "gray.600" }}
        _selected={{ bg: "gray.600" }}
        _expanded={{ bg: "gray.600" }}
      >
        {title ? title : null}
      </MenuButton>
      <MenuList
        w={"fit-content"}
        // w={buttonWidth}
        // minW={"200px"}
        // maxW={"200px"}
        zIndex={9999999999999}
        pos={"absolute"}
      >
        {menuItems.map((item, index) => {
          return (
            <MenuItem
              key={index}
              onClick={item.onClick}
              w={"100%"}
              display={"inline-flex"}
              alignItems={"center"}
              zIndex={2}
              // pos={"absolute"}
              _hover={{
                bg: disableHoverBackground
                  ? undefined
                  : // colorMode === "light" ?
                    // "gray.100",
                    // :
                    "gray.600",
              }}
              _active={{ bg: "gray.600" }}
              _selected={{ bg: "gray.600" }}
              _expanded={{ bg: "gray.600" }}
              color={"black"}
            >
              {item.leftIcon ? <Icon as={item.leftIcon} /> : null}
              {item?.text && (
                <Box pl={4} zIndex={2} color={"black"}>
                  <span className="text-black">{item.text}</span>
                </Box>
              )}
              {item?.component && item?.component}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
};
