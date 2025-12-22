import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useColorMode } from "@/shared/utils/theme.utils";
import type { ITaskDisplayCard } from "@/shared/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: ITaskDisplayCard;
}

export const DocumentTaskDetailsModal = ({ isOpen, onClose, task }: Props) => {
  const { colorMode } = useColorMode();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${colorMode === "dark" ? "text-gray-400" : ""} bg-white p-4`}>
        <DialogHeader className="mt-5">
          <DialogTitle>{task.name}</DialogTitle>
        </DialogHeader>

        <div className="mb-5">
          <p>{task.description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
