// Modal version of CreateUser component

import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateInternalUser } from "./CreateInternalUser";

interface IAddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDBCAUserModal = ({ isOpen, onClose }: IAddUserModalProps) => {
  const { colorMode } = useColorMode();
  const [isToastOpen, setIsToastOpen] = useState(false);
  const closeToast = () => setIsToastOpen(false);

  useEffect(() => {
    if (isToastOpen) {
      onClose();
    }
  }, [isToastOpen, onClose]);

  const handleToastClose = () => {
    closeToast();
    onClose();
  };

  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleToastClose()}>
      <DialogContent
        className={`max-w-4xl ${
          colorMode === "dark" ? "text-gray-400 bg-gray-800" : "bg-white"
        }`}
      >
        <DialogHeader>
          <DialogTitle>Add DBCA User</DialogTitle>
        </DialogHeader>
        <div>
          {/* <CreateUser onSuccess={openToast} isModal={true} /> */}
          <CreateInternalUser
            isModal
            onClose={handleToastClose}
            onSuccess={() => navigate("/users")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
