import type { ElementNode, LexicalEditor } from "lexical";

import invariant from "@/lib/utils/invariant";
import { useDisclosure } from "@chakra-ui/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $deleteTableColumn__EXPERIMENTAL,
    $deleteTableRow__EXPERIMENTAL,
    $getNodeTriplet,
    $getTableColumnIndexFromTableCellNode,
    $getTableNodeFromLexicalNodeOrThrow,
    $getTableRowIndexFromTableCellNode,
    $insertTableColumn__EXPERIMENTAL,
    $insertTableRow__EXPERIMENTAL,
    $isTableCellNode,
    $isTableRowNode,
    $isTableSelection,
    $unmergeCell,
    getTableObserverFromTableElement,
    HTMLTableElementWithWithTableSelectionState,
    TableCellHeaderStates,
    TableCellNode,
    TableRowNode,
    TableSelection,
} from "@lexical/table";
import {
    $createParagraphNode,
    $getRoot,
    $getSelection,
    $isElementNode,
    $isParagraphNode,
    $isRangeSelection,
    $isTextNode,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from "@/components/ui/context-menu"
import { Center, useColorMode } from "@chakra-ui/react"
import ColorPicker from "./ColourPicker/ColorPicker"

const $cellContainsEmptyParagraph = (cell: TableCellNode): boolean => {
    if (cell.getChildrenSize() !== 1) {
        return false;
    }
    const firstChild = cell.getFirstChildOrThrow();
    if (!$isParagraphNode(firstChild) || !firstChild.isEmpty()) {
        return false;
    }
    return true;
}

const $selectLastDescendant = (node: ElementNode): void => {
    const lastDescendant = node.getLastDescendant();
    if ($isTextNode(lastDescendant)) {
        lastDescendant.select();
    } else if ($isElementNode(lastDescendant)) {
        lastDescendant.selectEnd();
    } else if (lastDescendant !== null) {
        lastDescendant.selectNext();
    }
}

const currentCellBackgroundColor = (editor: LexicalEditor): null | string => {
    return editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
            const [cell] = $getNodeTriplet(selection.anchor);
            if ($isTableCellNode(cell)) {
                return cell.getBackgroundColor();
            }
        }
        return null;
    });
}

const computeSelectionCount = (selection: TableSelection): {
    columns: number;
    rows: number;
} => {
    const selectionShape = selection.getShape();
    return {
        columns: selectionShape.toX - selectionShape.fromX + 1,
        rows: selectionShape.toY - selectionShape.fromY + 1,
    };
}

// This is important when merging cells as there is no good way to re-merge weird shapes (a result
// of selecting merged cells and non-merged)
const isTableSelectionRectangular = (selection: TableSelection): boolean => {
    const nodes = selection.getNodes();
    const currentRows: Array<number> = [];
    let currentRow = null;
    let expectedColumns = null;
    let currentColumns = 0;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if ($isTableCellNode(node)) {
            const row = node.getParentOrThrow();
            invariant(
                $isTableRowNode(row),
                "Expected CellNode to have a RowNode parent",
            );
            if (currentRow !== row) {
                if (expectedColumns !== null && currentColumns !== expectedColumns) {
                    return false;
                }
                if (currentRow !== null) {
                    expectedColumns = currentColumns;
                }
                currentRow = row;
                currentColumns = 0;
            }
            const colSpan = node.__colSpan;
            for (let j = 0; j < colSpan; j++) {
                if (currentRows[currentColumns + j] === undefined) {
                    currentRows[currentColumns + j] = 0;
                }
                currentRows[currentColumns + j] += node.__rowSpan;
            }
            currentColumns += colSpan;
        }
    }
    return (
        (expectedColumns === null || currentColumns === expectedColumns) &&
        currentRows.every((v) => v === currentRows[0])
    );
}

const $canUnmerge = (): boolean => {
    const selection = $getSelection();
    if (
        ($isRangeSelection(selection) && !selection.isCollapsed()) ||
        ($isTableSelection(selection) && !selection.anchor.is(selection.focus)) ||
        (!$isRangeSelection(selection) && !$isTableSelection(selection))
    ) {
        return false;
    }
    const [cell] = $getNodeTriplet(selection.anchor);
    return cell.__colSpan > 1 || cell.__rowSpan > 1;
}


type TableCellActionMenuProps = Readonly<{
    contextRef: { current: null | HTMLElement };
    tableCellNode: TableCellNode;
    cellMerge: boolean;
}>;

export const TableContextMenuContent = (
    {
        contextRef,
        tableCellNode: _tableCellNode,
        cellMerge,
    }: TableCellActionMenuProps
) => {

    // Lexical Stuff
    const [editor] = useLexicalComposerContext();
    // console.log(editor)
    const [tableCellNode, updateTableCellNode] = useState(_tableCellNode);
    const [selectionCounts, updateSelectionCounts] = useState({
        columns: 1,
        rows: 1,
    });
    const [canMergeCells, setCanMergeCells] = useState(false);
    const [canUnmergeCell, setCanUnmergeCell] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState(
        () => currentCellBackgroundColor(editor) || "",
    );

    useEffect(() => console.log(backgroundColor), [backgroundColor])

    useEffect(() => {
        return editor.registerMutationListener(TableCellNode, (nodeMutations) => {
            const nodeUpdated =
                nodeMutations.get(tableCellNode.getKey()) === "updated";

            if (nodeUpdated) {
                console.log("updated!")
                editor.getEditorState().read(() => {
                    updateTableCellNode(tableCellNode.getLatest());
                });
                setBackgroundColor(currentCellBackgroundColor(editor) || "");
            }
        });
    }, [editor, tableCellNode]);


    useEffect(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            // Merge cells
            if ($isTableSelection(selection)) {
                const currentSelectionCounts = computeSelectionCount(selection);
                updateSelectionCounts(computeSelectionCount(selection));
                setCanMergeCells(
                    isTableSelectionRectangular(selection) &&
                    (currentSelectionCounts.columns > 1 ||
                        currentSelectionCounts.rows > 1),
                );
            }
            // Unmerge cell
            setCanUnmergeCell($canUnmerge());
        });
    }, [editor]);



    const clearTableSelection = useCallback(() => {
        editor.update(() => {
            if (tableCellNode.isAttached()) {
                const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
                const tableElement = editor.getElementByKey(
                    tableNode.getKey(),
                ) as HTMLTableElementWithWithTableSelectionState;

                if (!tableElement) {
                    throw new Error("Expected to find tableElement in DOM");
                }

                const tableSelection = getTableObserverFromTableElement(tableElement);
                if (tableSelection !== null) {
                    tableSelection.clearHighlight();
                }

                tableNode.markDirty();
                updateTableCellNode(tableCellNode.getLatest());
            }

            const rootNode = $getRoot();
            rootNode.selectStart();
        });
    }, [editor, tableCellNode]);

    const mergeTableCellsAtSelection = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isTableSelection(selection)) {
                const { columns, rows } = computeSelectionCount(selection);
                const nodes = selection.getNodes();
                let firstCell: null | TableCellNode = null;
                for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i];
                    if ($isTableCellNode(node)) {
                        if (firstCell === null) {
                            node.setColSpan(columns).setRowSpan(rows);
                            firstCell = node;
                            const isEmpty = $cellContainsEmptyParagraph(node);
                            let firstChild;
                            if (
                                isEmpty &&
                                $isParagraphNode((firstChild = node.getFirstChild()))
                            ) {
                                firstChild.remove();
                            }
                        } else if ($isTableCellNode(firstCell)) {
                            const isEmpty = $cellContainsEmptyParagraph(node);
                            if (!isEmpty) {
                                firstCell.append(...node.getChildren());
                            }
                            node.remove();
                        }
                    }
                }
                if (firstCell !== null) {
                    if (firstCell.getChildrenSize() === 0) {
                        firstCell.append($createParagraphNode());
                    }
                    $selectLastDescendant(firstCell);
                }
                // onClose();
            }
        });
    };

    const unmergeTableCellsAtSelection = () => {
        editor.update(() => {
            $unmergeCell();
        });
    };

    const insertTableRowAtSelection = useCallback(
        (shouldInsertAfter: boolean) => {
            editor.update(() => {
                $insertTableRow__EXPERIMENTAL(shouldInsertAfter);
                // onClose();
            });
        },
        [editor,
            // onClose
        ],
    );

    const insertTableColumnAtSelection = useCallback(
        (shouldInsertAfter: boolean) => {
            editor.update(() => {
                for (let i = 0; i < selectionCounts.columns; i++) {
                    $insertTableColumn__EXPERIMENTAL(shouldInsertAfter);
                }
                // onClose();
            });
        },
        [editor,
            // onClose, 
            selectionCounts.columns],
    );

    const deleteTableRowAtSelection = useCallback(() => {
        editor.update(() => {
            $deleteTableRow__EXPERIMENTAL();
            //   onClose();
        });
    }, [editor,
        // onClose
    ]);

    const deleteTableAtSelection = useCallback(() => {
        editor.update(() => {
            const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
            tableNode.remove();

            clearTableSelection();
            //   onClose();
        });
    }, [editor, tableCellNode, clearTableSelection,
        // onClose
    ]);

    const deleteTableColumnAtSelection = useCallback(() => {
        editor.update(() => {
            $deleteTableColumn__EXPERIMENTAL();
            //   onClose();
        });
    }, [editor,
        // onClose
    ]);

    const toggleTableRowIsHeader = useCallback(() => {
        editor.update(() => {
            const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

            const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode);

            const tableRows = tableNode.getChildren();

            if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
                throw new Error("Expected table cell to be inside of table row.");
            }

            const tableRow = tableRows[tableRowIndex];

            if (!$isTableRowNode(tableRow)) {
                throw new Error("Expected table row");
            }

            tableRow.getChildren().forEach((tableCell) => {
                if (!$isTableCellNode(tableCell)) {
                    throw new Error("Expected table cell");
                }

                tableCell.toggleHeaderStyle(TableCellHeaderStates.ROW);
            });

            clearTableSelection();
            //   onClose();
        });
    }, [editor, tableCellNode, clearTableSelection,
        //  onClose
    ]);

    const toggleTableColumnIsHeader = useCallback(() => {
        editor.update(() => {
            const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

            const tableColumnIndex =
                $getTableColumnIndexFromTableCellNode(tableCellNode);

            const tableRows = tableNode.getChildren<TableRowNode>();
            const maxRowsLength = Math.max(
                ...tableRows.map((row) => row.getChildren().length),
            );

            if (tableColumnIndex >= maxRowsLength || tableColumnIndex < 0) {
                throw new Error("Expected table cell to be inside of table row.");
            }

            for (let r = 0; r < tableRows.length; r++) {
                const tableRow = tableRows[r];

                if (!$isTableRowNode(tableRow)) {
                    throw new Error("Expected table row");
                }

                const tableCells = tableRow.getChildren();
                if (tableColumnIndex >= tableCells.length) {
                    // if cell is outside of bounds for the current row (for example various merge cell cases) we shouldn't highlight it
                    continue;
                }

                const tableCell = tableCells[tableColumnIndex];

                if (!$isTableCellNode(tableCell)) {
                    throw new Error("Expected table cell");
                }

                tableCell.toggleHeaderStyle(TableCellHeaderStates.COLUMN);
            }

            clearTableSelection();
            //   onClose();
        });
    }, [editor, tableCellNode, clearTableSelection,
        // onClose
    ]);

    let mergeCellButton: null | JSX.Element = null;
    if (cellMerge) {
        if (canMergeCells) {
            mergeCellButton = (
                <button
                    type="button"
                    className="item"
                    onClick={() => mergeTableCellsAtSelection()}
                    data-test-id="table-merge-cells"
                >
                    Merge cells
                </button>
            );
        } else if (canUnmergeCell) {
            mergeCellButton = (
                <button
                    type="button"
                    className="item"
                    onClick={() => unmergeTableCellsAtSelection()}
                    data-test-id="table-unmerge-cells"
                >
                    Unmerge cells
                </button>
            );
        }
    }

    //   Actual Chakra Menu
    const { colorMode } = useColorMode();
    const menuBgColor = colorMode === "light" ? "bg-white" : "bg-gray-800";
    const menuLabelBgColor =
        colorMode === "light" ? "bg-slate-50" : "bg-gray-700";
    const textColor = colorMode === "light" ? "text-black" : "text-white";
    const seperatorColor = colorMode === "light" ? "bg-border" : "bg-gray-500";

    // const [backgroundColor, setBackgroundColor] = useState("#ffa500");

    return (
        <ContextMenuContent className={`w-64 ${menuBgColor}`}>
            <ContextMenuLabel
                inset
                className={`select-none ${menuLabelBgColor} ${textColor}`}
            >
                Cell
            </ContextMenuLabel>

            <ContextMenuSub>
                <ContextMenuSubTrigger inset className={`${textColor}`}>
                    Background Colour
                </ContextMenuSubTrigger>
                <ContextMenuSubContent
                    className={`w-[265px] ${menuBgColor} ${textColor}`}
                >
                    <Center
                        px={"25px"}
                    >
                        <ColorPicker
                            editor={editor}
                            color={backgroundColor}
                            onChange={setBackgroundColor}
                            tableCellNode={tableCellNode}
                            updateTableCellNode={updateTableCellNode}
                            w={240}
                            h={150}
                            currentCellBackgroundColor={currentCellBackgroundColor}
                            setBackgroundColor={setBackgroundColor}
                        />
                    </Center>
                </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator className={`${seperatorColor}`} />

            <ContextMenuLabel
                inset
                className={`select-none ${menuLabelBgColor} ${textColor}`}
            >
                Rows and Columns
            </ContextMenuLabel>

            <ContextMenuSub>
                <ContextMenuSubTrigger inset className={`${textColor}`}>
                    Insert
                </ContextMenuSubTrigger>
                <ContextMenuSubContent
                    className={`w-48 ${textColor} ${menuBgColor} `}
                >
                    <ContextMenuItem className={`${textColor}`}>
                        Insert Row Above
                    </ContextMenuItem>
                    <ContextMenuItem className={`${textColor}`}>
                        Insert Row Below
                    </ContextMenuItem>
                    <ContextMenuSeparator className={`${seperatorColor}`} />

                    <ContextMenuItem className={`${textColor}`}>
                        Insert Column Left
                    </ContextMenuItem>
                    <ContextMenuItem className={`${textColor}`}>
                        Insert Column Right
                    </ContextMenuItem>
                </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
                <ContextMenuSubTrigger inset className={`${textColor}`}>
                    Delete
                </ContextMenuSubTrigger>
                <ContextMenuSubContent
                    className={`w-48 ${textColor} ${menuBgColor} `}
                >
                    <ContextMenuItem className={`${textColor}`}>
                        Delete Row
                    </ContextMenuItem>
                    <ContextMenuSeparator className={`${seperatorColor}`} />

                    <ContextMenuItem className={`${textColor}`}>
                        Delete Column
                    </ContextMenuItem>
                </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator className={`${seperatorColor}`} />
            <ContextMenuLabel
                inset
                className={`select-none ${menuLabelBgColor} ${textColor}`}
            >
                Table
            </ContextMenuLabel>
            <ContextMenuItem inset className={`${textColor}`}>
                Delete Table
            </ContextMenuItem>
        </ContextMenuContent>
    )
}