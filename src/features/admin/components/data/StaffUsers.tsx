import { AddDBCAUserModal } from "@/features/admin/components/modals/AddDBCAUserModal";
import { MergeUsersModal } from "@/features/admin/components/modals/MergeUsersModal";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useState } from "react";

export const StaffUsers = () => {
  const { colorMode } = useColorMode();
  const [isAddDBCAUserModalOpen, setIsAddDBCAUserModalOpen] = useState(false);
  const [isMergeUserModalOpen, setIsMergeUserModalOpen] = useState(false);

  return (
    <>
      <AddDBCAUserModal
        isOpen={isAddDBCAUserModalOpen}
        onClose={() => setIsAddDBCAUserModalOpen(false)}
      />
      <MergeUsersModal
        isOpen={isMergeUserModalOpen}
        onClose={() => setIsMergeUserModalOpen(false)}
      />
      <div>
        <div className="flex items-center mt-4">
          <p className="text-xl py-4 flex-1">
            Admin User Actions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          className={`text-white ${
            colorMode === "light" 
              ? "bg-blue-500 hover:bg-blue-400" 
              : "bg-blue-600 hover:bg-blue-500"
          }`}
          onClick={() => setIsAddDBCAUserModalOpen(true)}
        >
          Add a DBCA User
        </Button>
        <Button
          className={`text-white ${
            colorMode === "light" 
              ? "bg-red-600 hover:bg-red-500" 
              : "bg-red-700 hover:bg-red-600"
          }`}
          onClick={() => setIsMergeUserModalOpen(true)}
        >
          Merge Users
        </Button>
        <Button
          className={`text-white ${
            colorMode === "light" 
              ? "bg-gray-800 hover:bg-gray-700" 
              : "bg-gray-900 hover:bg-gray-800"
          }`}
          disabled={true}
        >
          Set Maintainer
        </Button>
        <Button
          className={`text-white ${
            colorMode === "light" 
              ? "bg-orange-600 hover:bg-orange-500" 
              : "bg-orange-700 hover:bg-orange-600"
          }`}
          disabled={true}
        >
          Set User Caretaker
        </Button>
      </div>
    </>
  );
};
