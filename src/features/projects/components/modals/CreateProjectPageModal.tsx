// WIP: Delete User Modal - for removing users from the system all together. Admin only.

import { CreateProject } from "@/pages/projects/CreateProject";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useColorMode } from "@/shared/utils/theme.utils";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectPageModal = ({ isOpen, onClose }: IModalProps) => {
  const { colorMode } = useColorMode();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-6xl ${
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      }`}>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <CreateProject />
        </div>
      </DialogContent>
    </Dialog>
  );
};
