// A template for a RTE simple button - props fill out its icon, text and functionality

import { useState } from "react";
import { FaTable } from "react-icons/fa";
import "@/styles/texteditor.css";
import { BaseToolbarMenuButton } from "./BaseToolbarMenuButton";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  $getSelection,
  INSERT_LINE_BREAK_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
  LexicalEditor,
} from "lexical";
import { cn } from "@/shared/utils";

interface TableGridProps {
  activeEditor: LexicalEditor;
}

const TableGrid = ({ activeEditor }: TableGridProps) => {
  const [tableRows, setTableRows] = useState(0);
  const [tableColumns, setTableColumns] = useState(0);

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
        console.log(selectedNode.getParentOrThrow().getType());
      } else {
        console.log("rootnode");
      }

      activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
        columns: columns,
        rows: rows,
      });
    });
  };

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
          <div
            key={`${row}-${col}`}
            className={cn(
              "w-6 h-6 border border-border cursor-pointer",
              isFirstRowOrColumn
                ? isHighlighted
                  ? "bg-blue-300 dark:bg-blue-400"
                  : "bg-muted"
                : isHighlighted
                  ? "bg-blue-200 dark:bg-blue-300"
                  : "bg-background",
              "hover:bg-blue-400 dark:hover:bg-blue-500"
            )}
            onMouseEnter={() => handleMouseEnter(row, col)}
            onClick={onGridClick}
          />
        );
      }
      grid.push(
        <div key={row} className="grid grid-cols-7 gap-0">
          {cols}
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Table amount */}
      <p className="text-lg pb-2">
        {tableColumns} x {tableRows} table
      </p>
      {/* Table grid */}
      <div>{createGrid()}</div>
    </div>
  );
};

export const TableDropdown = ({ activeEditor }: TableGridProps) => {
  return (
    <BaseToolbarMenuButton
      tooltipText="Add Table"
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
