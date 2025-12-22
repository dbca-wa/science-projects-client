import { useState } from "react";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { ActionAdminRequestModal } from "./ActionAdminRequestModal";

export const AdminTableRowWithModal = ({
  row,
  colorMode,
  goToProjectDocument,
}) => {
  const [isActionAdminRequestModalOpen, setIsActionAdminRequestModalOpen] = useState(false);
  const openActionAdminRequestModal = () => setIsActionAdminRequestModalOpen(true);
  const closeActionAdminRequestModal = () => setIsActionAdminRequestModalOpen(false);

  const handleRowClick = (e) => {
    if (row.original.action === "deleteproject") {
      goToProjectDocument(e, row.original.project.pk);
    } else if (
      row.original.action === "mergeuser" ||
      row.original.action === "setcaretaker"
    ) {
      openActionAdminRequestModal();
    }
  };
  const twRowClassLight = "hover:cursor-pointer hover:bg-blue-50";
  const twRowClassDark = "hover:cursor-pointer hover:bg-inherit";
  return (
    <TableRow
      key={row.id}
      className={colorMode === "light" ? twRowClassLight : twRowClassDark}
      data-state={row.getIsSelected() && "selected"}
      onClick={handleRowClick}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
          {(row.original.action === "mergeuser" ||
            row.original.action === "setcaretaker") && (
            <ActionAdminRequestModal
              task={row.original}
              action={row.original.action}
              taskPk={row.original.pk ?? row.original.id}
              isOpen={isActionAdminRequestModalOpen}
              onClose={closeActionAdminRequestModal}
            />
          )}
        </TableCell>
      ))}
    </TableRow>
  );
};
