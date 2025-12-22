import { INSERT_LINE_BREAK_COMMAND, LexicalEditor } from "lexical";
import { useEffect, useState } from "react";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface Props {
  isOpen: boolean;
  activeEditor: LexicalEditor;
  onClose: () => void;
}

export const InsertTableModal = ({ isOpen, activeEditor, onClose }: Props) => {
  const [rows, setRows] = useState("5");
  const [columns, setColumns] = useState("5");
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    const row = Number(rows);
    const column = Number(columns);
    if (row && row > 0 && row <= 11 && column && column > 0 && column <= 7) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [rows, columns]);

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns,
      rows,
    });
    activeEditor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, null);

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="mt-5">Insert Table</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mb-5">
          <div className="space-y-2">
            <Label htmlFor="rows">Rows</Label>
            <Input
              id="rows"
              placeholder="# of rows (1-51)"
              onChange={(e) => setRows(e.target.value)}
              value={rows}
              data-test-id="table-modal-rows"
              type="number"
            />
            <p className="text-sm text-muted-foreground">
              Enter the number of rows for the table (Max 11, including header)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="columns">Columns</Label>
            <Input
              id="columns"
              placeholder="# of columns (1-7)"
              onChange={(e) => setColumns(e.target.value)}
              value={columns}
              data-test-id="table-modal-columns"
              type="number"
            />
            <p className="text-sm text-muted-foreground">
              Enter the number of columns for the table (Max 7, including header)
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={isDisabled}
              onClick={onClick}
              className="bg-green-500 hover:bg-green-400 dark:bg-green-600 dark:hover:bg-green-500 text-white"
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
