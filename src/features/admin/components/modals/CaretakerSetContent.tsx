// Component/Route for handling user creation and the accomponying validation

import { Head } from "@/shared/components/layout/base/Head";
import { UserArraySearchDropdown } from "@/features/users/components/UserArraySearchDropdown";
import { mergeUsers } from "@/features/users/services/users.service";
import type { IMergeUser, IUserData } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

interface IProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const CaretakerSetContent = ({
  onSuccess,
  isModal,
  onClose,
}: IProps) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();

  const caretakerToast = (data) => {
    toast.success(data.title);
  };

  const [primaryUser, setPrimaryUser] = useState<IUserData | null>(null);
  const [secondaryUsers, setSecondaryUsers] = useState<IUserData[] | null>([]);

  const addSecondaryUserPkToArray = (user: IUserData) => {
    setSecondaryUsers((prev) => [...prev, user]);
  };

  const removeSecondaryUserPkFromArray = (user: IUserData) => {
    setSecondaryUsers((prev) => prev.filter((item) => item !== user));
  };

  const clearSecondaryUserArray = () => {
    setSecondaryUsers([]);
  };

  //   const caretakerAdminMutation = useMutation({
  //     mutationFn: setCaretaker,
  //     onMutate: () => {
  //       toast.loading("Setting caretaker...");
  //     },
  //     onSuccess: () => {
  //       toast.success("Merged!", {
  //         description: "Caretaker set!",
  //       });
  //       clearSecondaryUserArray();
  //       setPrimaryUser(null);
  //       onClose?.();
  //       queryClient.invalidateQueries({ queryKey: ["users"] });
  //     },
  //     onError: () => {
  //       toast.error("Failed", {
  //         description: "Something went wrong!",
  //       });
  //     },
  //   });

  const onSubmitCaretaker = (formData: IMergeUser) => {
    // console.log("SUBMISSION DATA:", formData);
    console.log(formData);
    // Transform into just primary keys
    const primaryUserPk = primaryUser?.pk;
    const secondaryUserPks = secondaryUsers?.map((user) => user.pk);
    // Mutate with primary keys
    // caretakerAdminMutation.mutate({ primaryUserPk, secondaryUserPks });
  };

  return (
    <>
      <Head title={"Merge Users"} />
      {!isModal && (
        <div>
          <p className="mb-8 font-bold text-2xl">
            Set User Caretaker
          </p>
        </div>
      )}

      <div className="mb-3">
        <p className={colorMode === "light" ? "text-blue-500" : "text-blue-400"}>
          This form is for setting a caretaker for a user who is on leave or has
          left the department.
        </p>
        <ul className="ml-6 mt-2 list-disc">
          <li>
            The primary user is the user who needs a caretaker
          </li>
          <li
            className={`underline ${colorMode === "light" ? "text-red-500" : "text-red-400"}`}
          >
            The secondary user/s will be able to act on their behalf until
            caretaker status is removed.
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div>
          <UserArraySearchDropdown
            isRequired
            autoFocus
            isEditable
            setterFunction={setPrimaryUser}
            ignoreUserPks={[...secondaryUsers.map((user) => user.pk)]}
            label="Primary User"
            placeholder="Search for primary user who is going away"
            helperText="This user will be able to act normally"
          />
        </div>
        <div>
          <UserArraySearchDropdown
            isRequired
            isEditable
            array={secondaryUsers}
            arrayAddFunction={addSecondaryUserPkToArray}
            arrayRemoveFunction={removeSecondaryUserPkFromArray}
            arrayClearFunction={clearSecondaryUserArray}
            ignoreUserPks={[primaryUser?.pk]}
            label="Secondary User/s"
            placeholder="Search for users"
            helperText="The user/s you would like to become caretaker for the primary user"
          />
        </div>
      </div>

      {/* ======================================================= */}

      <div className="mt-5 flex justify-end">
        <Button
          className={`ml-3 ${
            colorMode === "light" 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-red-600 text-white hover:bg-red-400"
          }`}
          disabled={
            true
            // caretakerAdminMutation.isPending ||
            // secondaryUsers?.length < 1 ||
            // !primaryUser
          }
          //   isLoading={
          //     true
          //     caretakerAdminMutation.isPending
          //   }
          //   onClick={() => {
          //     onSubmitCaretaker({
          //       primaryUser,
          //       secondaryUsers,
          //     });
          //   }}
        >
          Set Caretaker
        </Button>
      </div>
    </>
  );
};
