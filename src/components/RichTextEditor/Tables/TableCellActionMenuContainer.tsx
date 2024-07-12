import {
  ContextMenu,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import "@/styles/texteditor.css";
import { Box } from "@chakra-ui/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getTableCellNodeFromLexicalNode,
  TableCellNode,
} from "@lexical/table";
import { $getSelection, $isRangeSelection } from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import { TableContextMenuContent } from "./TableContextMenuContent";

interface Props {
  anchorElem: HTMLElement;
  cellMerge: boolean;
}

export const TableCellActionMenuContainer = ({
  anchorElem,
  cellMerge,
}: Props) => {

  const [editor] = useLexicalComposerContext();

  const menuButtonRef = useRef(null);
  const menuRootRef = useRef(null);

  const [tableCellNode, setTableMenuCellNode] = useState<TableCellNode | null>(
    null,
  );

  const $moveMenu = useCallback(() => {
    const menu = menuButtonRef.current;
    const selection = $getSelection();
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (selection == null || menu == null) {
      setTableMenuCellNode(null);
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      $isRangeSelection(selection) &&
      rootElement !== null &&
      nativeSelection !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(
        selection.anchor.getNode(),
      );

      if (tableCellNodeFromSelection == null) {
        setTableMenuCellNode(null);
        return;
      }

      const tableCellParentNodeDOM = editor.getElementByKey(
        tableCellNodeFromSelection.getKey(),
      );

      if (tableCellParentNodeDOM == null) {
        setTableMenuCellNode(null);
        return;
      }

      setTableMenuCellNode(tableCellNodeFromSelection);
    } else if (!activeElement) {
      setTableMenuCellNode(null);
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.getEditorState().read(() => {
        $moveMenu();
      });
    });
  });

  useEffect(() => {
    const menuButtonDOM = menuButtonRef.current as HTMLButtonElement | null;

    if (menuButtonDOM != null && tableCellNode != null) {
      const tableCellNodeDOM = editor.getElementByKey(tableCellNode.getKey());

      if (tableCellNodeDOM != null) {
        const tableCellRect = tableCellNodeDOM.getBoundingClientRect();
        const menuRect = menuButtonDOM.getBoundingClientRect();
        const anchorRect = anchorElem.getBoundingClientRect();

        const top = tableCellRect.top - anchorRect.top + 4;
        const left = tableCellRect.right - menuRect.width - 10 - anchorRect.left;

        menuButtonDOM.style.opacity = "1";
        menuButtonDOM.style.transform = `translate(${left}px, ${top}px)`;
      } else {
        menuButtonDOM.style.opacity = "0";
        menuButtonDOM.style.transform = "translate(-10000px, -10000px)";
      }
    }
  }, [menuButtonRef, tableCellNode, editor, anchorElem]);

  const prevTableCellDOM = useRef(tableCellNode);

  useEffect(() => {
    // if (prevTableCellDOM.current !== tableCellNode) {
    //   setIsMenuOpen(false);
    // }

    prevTableCellDOM.current = tableCellNode;
  }, [prevTableCellDOM, tableCellNode]);

  return (
    <Box
      pos={"absolute"}
      bg={"red.500"}
      top={0}
      left={0}
      willChange={"transform"}
      ref={menuButtonRef}>
      {tableCellNode != null && (
        <Box pos={"relative"}>
          <ContextMenu>
            {/* Area to right click to make menu popup */}
            <ContextMenuTrigger
              className={`flex h-full w-full items-center justify-center rounded-md border border-dashed text-sm absolute`}
              // style={{ background: backgroundColor }}
              ref={menuRootRef}
            >
              Right click here
            </ContextMenuTrigger>

            {/* When right clicked the below appears */}
            <TableContextMenuContent
              tableCellNode={tableCellNode}
              cellMerge={cellMerge}
              contextRef={menuRootRef}
            />
          </ContextMenu>
          {/* 
          {isMenuOpen && (
            <TableActionMenu
              contextRef={menuRootRef}
              setIsMenuOpen={setIsMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              tableCellNode={tableCellNode}
              cellMerge={cellMerge}
            // showColorPickerModal={showColorPickerModal}
            />
          )} */}
        </Box>
      )}
    </Box>
    // <div className="table-cell-action-button-container" ref={menuButtonRef}>
    //   {tableCellNode != null && (
    //     <>
    //       <button
    //         type="button"
    //         className="table-cell-action-button chevron-down"
    //         onClick={(e) => {
    //           e.stopPropagation();
    //           setIsMenuOpen(!isMenuOpen);
    //         }}
    //         ref={menuRootRef}
    //       >
    //         <i className="chevron-down" />
    //       </button>

    //       {isMenuOpen && (
    //         <TableActionMenu
    //           contextRef={menuRootRef}
    //           setIsMenuOpen={setIsMenuOpen}
    //           onClose={() => setIsMenuOpen(false)}
    //           tableCellNode={tableCellNode}
    //           cellMerge={cellMerge}
    //         // showColorPickerModal={showColorPickerModal}
    //         />
    //       )}
    //     </>
    //   )}
    // </div>
  );
};
