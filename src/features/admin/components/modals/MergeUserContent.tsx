// Component/Route for handling user creation and the accomponying validation

import { Head } from "@/shared/components/layout/base/Head";
import { UserArraySearchDropdown } from "@/features/users/components/UserArraySearchDropdown";
import { mergeUsers } from "@/features/users/services/users.service";
import type { IMergeUser, IUserData } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef, useState } from "react";

interface IProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const MergeUserContent = ({ onSuccess, isModal, onClose }: IProps) => {
  const { colorMode } = useColorMode();
  const ToastIdRef = useRef<string | number | undefined>(undefined);
  const queryClient = useQueryClient();

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

  const mergeMutation = useMutation({
    mutationFn: mergeUsers,
    onMutate: () => {
      ToastIdRef.current = toast.loading("Merging...");
    },
    onSuccess: () => {
      if (ToastIdRef.current) {
        toast.success("Merged!", {
          description: "The users are now one!",
          id: ToastIdRef.current,
        });
      }
      clearSecondaryUserArray();
      setPrimaryUser(null);
      onClose?.();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError) => {
      if (ToastIdRef.current) {
        toast.error("Failed", {
          description: `${Object.values(error.response.data)[0] || "An error occurred"}`,
          id: ToastIdRef.current,
        });
      }
    },
  });

  const onSubmitMerge = (formData: IMergeUser) => {
    // console.log("SUBMISSION DATA:", formData);
    console.log(formData);
    // Transform into just primary keys
    const primaryUserPk = primaryUser?.pk;
    const secondaryUserPks = secondaryUsers?.map((user) => user.pk);
    // Mutate with primary keys
    mergeMutation.mutate({ primaryUserPk, secondaryUserPks });
    // mergeMutation.mutate(formData);
  };

  return (
    <>
      <Head title={"Merge Users"} />
      {!isModal && (
        <div>
          <p className="mb-8 font-bold text-2xl">
            Merge Users
          </p>
        </div>
      )}

      <div className="mb-3">
        <p className={colorMode === "light" ? "text-blue-500" : "text-blue-400"}>
          This form is for merging duplicate users. Please ensure that the user
          you merge has the correct information.
        </p>
        <ul className="ml-6 mt-2 list-disc">
          <li>
            The primary user will receive any projects belonging to the
            secondary user/s
          </li>
          <li>
            The primary user will receive any comments belonging to the
            secondary user/s
          </li>
          <li>
            The primary user will receive any documents and roles belonging to
            the secondary user/s on projects, where applicable (if primary user
            is already on the project and has a higher role, they will maintain
            the higher role)
          </li>
          <li className={`underline ${colorMode === "light" ? "text-red-500" : "text-red-400"}`}>
            The secondary user/s will be deleted from the system. This is
            permanent.
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
            placeholder="Search for primary user to merge into"
            helperText="This user will be the primary user after the merge, others will be deleted"
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
            placeholder="Search for an user"
            helperText="The user/s you would like to merge into the primary user"
          />
        </div>
      </div>

      <div className="flex mt-5 justify-end">
        <Button
          className={`ml-3 ${
            colorMode === "light" 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-red-600 hover:bg-red-400 text-white"
          }`}
          disabled={
            mergeMutation.isPending ||
            secondaryUsers?.length < 1 ||
            !primaryUser
          }
          onClick={() => {
            onSubmitMerge({
              primaryUser,
              secondaryUsers,
            });
          }}
        >
          {mergeMutation.isPending ? "Merging..." : "Merge"}
        </Button>
      </div>
    </>
  );
};
