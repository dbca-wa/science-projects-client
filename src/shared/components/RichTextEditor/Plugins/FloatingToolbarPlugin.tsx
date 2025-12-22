import { $isCodeHighlightNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

import { getDOMRangeRect } from "@/shared/utils/getDOMRangeRect";
import { getSelectedNode } from "@/shared/utils/getSelectedNode";
import { setFloatingElemPosition } from "@/shared/utils/setFloatingElemPosition";
import { useColorMode } from "@/shared/utils/theme.utils";
import {
  $getNearestBlockElementAncestorOrThrow,
  mergeRegister,
} from "@lexical/utils";
import { createPortal } from "react-dom";

// import {INSERT_INLINE_COMMAND} from '../CommentPlugin';
import { FaBold, FaItalic, FaUnderline } from "react-icons/fa";
import { ImClearFormatting } from "react-icons/im";
import { MdSubscript, MdSuperscript } from "react-icons/md";
import { RevisedBaseToolbarButton } from "../Buttons/RevisedBaseToolbarButton";
import { VerticalDivider } from "../Toolbar/VerticalDivider";

interface IFloatingToolbar {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  // isCode: boolean;
  isItalic: boolean;
  // isLink: boolean;
  // isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
}

export const FloatingToolbar = ({
  editor,
  anchorElem,
  // isLink,
  isBold,
  isItalic,
  isUnderline,
  // isCode,
  // isStrikethrough,
  isSubscript,
  isSuperscript,
}: IFloatingToolbar) => {
  const { colorMode } = useColorMode();
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

  function mouseMoveListener(e: MouseEvent) {
    if (
      popupCharStylesEditorRef?.current &&
      (e.buttons === 1 || e.buttons === 3)
    ) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== "none") {
        const x = e.clientX;
        const y = e.clientY;
        const elementUnderMouse = document.elementFromPoint(x, y);

        if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
          // Mouse is not over the target element => not a normal click, but probably a drag
          popupCharStylesEditorRef.current.style.pointerEvents = "none";
        }
      }
    }
  }
  function mouseUpListener() {
    if (popupCharStylesEditorRef?.current) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== "auto") {
        popupCharStylesEditorRef.current.style.pointerEvents = "auto";
      }
    }
  }

  useEffect(() => {
    if (popupCharStylesEditorRef?.current) {
      document.addEventListener("mousemove", mouseMoveListener);
      document.addEventListener("mouseup", mouseUpListener);

      return () => {
        document.removeEventListener("mousemove", mouseMoveListener);
        document.removeEventListener("mouseup", mouseUpListener);
      };
    }
  }, [popupCharStylesEditorRef]);

  const updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = window.getSelection();

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(
        rangeRect,
        popupCharStylesEditorElem,
        anchorElem,
        //   isLink,
      );
    }
  }, [editor, anchorElem]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateTextFormatFloatingToolbar();
      });
    };

    window.addEventListener("resize", update);
    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [editor, updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateTextFormatFloatingToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateTextFormatFloatingToolbar]);
  return (
    <div
      ref={popupCharStylesEditorRef}
      className={`flex z-50 p-1 absolute top-2 left-0.5 opacity-0 rounded-lg transition-opacity duration-500 shadow-lg ${
        colorMode === "light" ? "bg-white" : "bg-gray-700"
      }`}
      style={{
        willChange: "transform",
      }}
    >
      {editor.isEditable() && (
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
                          textNode,
                        ).setFormat("");
                      }
                      node = textNode;
                    }
                  });
                }
              });
            }}
          >
            <ImClearFormatting />
          </RevisedBaseToolbarButton>
        </>
      )}
    </div>
  );
};

function useFloatingToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
): React.JSX.Element | null {
  const [isText, setIsText] = useState(false);
  // const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  // const [isStrikethrough, setIsStrikethrough] = useState(false);

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
      // setIsStrikethrough(selection.hasFormat('strikethrough'));

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
    );
  }, [editor, updatePopup]);

  if (!isText) {
    return null;
  }

  return createPortal(
    <FloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
      // isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isSubscript={isSubscript}
      // isStrikethrough={isStrikethrough}
      isSuperscript={isSuperscript}
      isUnderline={isUnderline}
    />,
    anchorElem,
  );
}

export default function FloatingToolbarPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingToolbar(editor, anchorElem);
}
