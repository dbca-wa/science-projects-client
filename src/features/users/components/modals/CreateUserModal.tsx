// Modal version of CreateUser component

import { CreateUser } from "@/pages/users/CreateUser";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface IAddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateUserModal = ({ isOpen, onClose }: IAddUserModalProps) => {
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
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <CreateUser
            isModal
            onClose={handleToastClose}
            onSuccess={() => navigate("/users")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
