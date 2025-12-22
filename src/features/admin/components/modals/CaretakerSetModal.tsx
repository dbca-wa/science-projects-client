// Modal version of CreateUser component

import { useColorMode } from "@/shared/utils/theme.utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaretakerSetContent } from "./CaretakerSetContent";

interface IAddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CaretakerSetModal = ({ isOpen, onClose }: IAddUserModalProps) => {
  const { colorMode } = useColorMode();
  const [isToastOpen, setIsToastOpen] = useState(false);

  useEffect(() => {
    if (isToastOpen) {
      onClose();
    }
  }, [isToastOpen, onClose]);

  const handleToastClose = () => {
    setIsToastOpen(false);
    onClose();
  };

  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Set User Caretaker</DialogTitle>
        </DialogHeader>
        <div>
          <CaretakerSetContent
            isModal
            onClose={handleToastClose}
            onSuccess={() => navigate("/users")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
