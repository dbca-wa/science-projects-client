import {
  addRemoveUserFromEmailListCall,
  type IAdjustEmailListProps,
} from "@/features/admin/services/admin.service";
import type { EmailListPerson, IEmailListUser } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { UserArraySearchDropdown } from "@/features/users/components/UserArraySearchDropdown";

interface IEmailListModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisionPk: number;
  refetch: () => void;
  currentList: IEmailListUser[];
}

const AddRemoveUserFromEmailListModal = ({
  isOpen,
  onClose,
  divisionPk,
  refetch,
  currentList,
}: IEmailListModalProps) => {
  const [usersToAction, setUsersToAction] = useState<EmailListPerson[]>(
    currentList || [],
  );

  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();

  // Use react-hook-form but with manual value handling
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isValid },
  } = useForm<IAdjustEmailListProps>();

  // Update the form value whenever usersToAction changes
  useEffect(() => {
    setValue("usersList", usersToAction?.map((u) => u.pk) || []);
  }, [usersToAction, setValue]);

  // Debug log to check updates
  useEffect(() => {
    if (divisionPk === 1) {
      // console.log("Users to action updated:", usersToAction);
      // console.log(
      //   "Users list for submission:",
      //   usersToAction?.map((u) => u.pk),
      // );
    }
  }, [usersToAction, divisionPk]);

  const addRemoveEmailListMutation = useMutation({
    mutationFn: addRemoveUserFromEmailListCall,
    onMutate: () => {
      toast.loading("Adjusting Email List");
    },
    onSuccess: async () => {
      toast.success("Success", {
        description: "Adjusted Email List",
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["divisions"] });
        refetch();
        onClose();
      }, 350);
    },
    onError: (error: AxiosError) => {
      toast.error("Could not action request", {
        description: `${error.response?.data}`,
      });
    },
  });

  const handleAction = (formData: IAdjustEmailListProps) => {
    // Important: Get the latest users list directly from state
    const dataToSubmit = {
      ...formData,
      usersList: usersToAction?.map((u) => u.pk) || [],
    };

    // console.log("Submitting form data:", dataToSubmit);
    addRemoveEmailListMutation.mutate(dataToSubmit);
  };

  const handleAddUser = (user: EmailListPerson) => {
    setUsersToAction((prev) => [...(prev || []), user]);
  };

  const handleRemoveUser = (user: EmailListPerson) => {
    setUsersToAction((prev) =>
      (prev || []).filter((existingUser) => existingUser.pk !== user.pk),
    );
  };

  const handleClearAll = () => {
    setUsersToAction([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <form onSubmit={handleSubmit(handleAction)}>
        <DialogContent
          className={`md:max-w-md ${
            colorMode === "dark" ? "text-gray-400 bg-gray-800" : "bg-white"
          }`}
        >
          <DialogHeader>
            <DialogTitle>Adjust Email List</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Input
                type="hidden"
                {...register("divisionPk", {
                  required: true,
                  value: divisionPk,
                })}
                readOnly
              />
            </div>

            {/* Not setting a direct value here, but using setValue in the useEffect instead */}
            <Input
              type="hidden"
              {...register("usersList", {
                validate: (value) => Array.isArray(value), // This will pass for empty arrays too
              })}
            />

            <UserArraySearchDropdown
              isRequired={false}
              label={"User List"}
              placeholder={"Enter a user's name"}
              helperText={"Select users for this email list"}
              array={usersToAction}
              arrayAddFunction={handleAddUser}
              arrayRemoveFunction={handleRemoveUser}
              arrayClearFunction={handleClearAll}
              ignoreUserPks={usersToAction?.map((u) => u.pk)}
              internalOnly
            />
          </div>
          
          <DialogFooter>
            <div className="flex flex-col w-full">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => onClose()}>
                  Cancel
                </Button>
                <Button
                  className={`text-white ${
                    colorMode === "light" 
                      ? "bg-green-500 hover:bg-green-400" 
                      : "bg-green-600 hover:bg-green-500"
                  }`}
                  disabled={
                    addRemoveEmailListMutation.isPending ||
                    !divisionPk ||
                    isSubmitting ||
                    !isValid
                  }
                  type="submit"
                >
                  {addRemoveEmailListMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default AddRemoveUserFromEmailListModal;
