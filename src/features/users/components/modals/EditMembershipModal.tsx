// Modal for editing a user's membership for their profile

import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  type IMembershipUpdateVariables,
  type IProfileUpdateSuccess,
  type MutationError,
  updateMembership,
} from "@/features/users/services/users.service";
import { useForm } from "react-hook-form";
import type { IAffiliation, IBranch, IBusinessArea } from "@/shared/types";
import { useBusinessAreas } from "@/features/business-areas/hooks/useBusinessAreas";
import { useBranches } from "@/features/admin/hooks/useBranches";
import { useAffiliations } from "@/features/admin/hooks/useAffiliations";
import { AffiliationCreateSearchDropdown } from "@/features/admin/components/AffiliationCreateSearchDropdown";

interface IEditMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOrganisationData: string;
  currentBranchData: IBranch;
  currentBaData: IBusinessArea;
  currentAffiliationData: IAffiliation;
  userId: number;
}

export const EditMembershipModal = ({
  isOpen,
  onClose,
  currentBranchData,
  currentBaData,
  currentAffiliationData,
  userId,
}: IEditMembershipModalProps) => {
  const { colorMode } = useColorMode();
  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

  const { baLoading, baData } = useBusinessAreas();
  const { branchesLoading, branchesData } = useBranches();
  const { affiliationsLoading, affiliationsData } = useAffiliations();

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const mutation = useMutation<
    IProfileUpdateSuccess,
    MutationError,
    IMembershipUpdateVariables
  >({
    // Start of mutation handling
    mutationFn: updateMembership,
    onMutate: () => {
      const toastId = toast.loading("Updating membership...");
      setLoadingToastId(toastId);
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [`membership`, userId] });
      queryClient.refetchQueries({ queryKey: [`me`] });

      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.success("Information Updated");
      //  Close the modal
      onClose?.();
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while updating"; // Default error message

      const collectErrors = (data, prefix = "") => {
        if (typeof data === "string") {
          return [data];
        }

        const errorMessages = [];

        for (const key in data) {
          if (Array.isArray(data[key])) {
            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
            errorMessages.push(...nestedErrors);
          } else if (typeof data[key] === "object") {
            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
            errorMessages.push(...nestedErrors);
          } else {
            errorMessages.push(`${prefix}${key}: ${data[key]}`);
          }
        }

        return errorMessages;
      };

      if (error.response && error.response.data) {
        const errorMessages = collectErrors(error.response.data);
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join("\n"); // Join errors with new lines
        }
      } else if (error.message) {
        errorMessage = error.message; // Use the error message from the caught exception
      }

      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.error(`Update failed: ${errorMessage}`);
    },
  });

  //  React Hook Form
  const { register, handleSubmit, setValue } =
    useForm<IMembershipUpdateVariables>();

  //  When submitting form - starts the mutation
  const onSubmit = async ({
    userPk,
    branch,
    business_area,
    affiliation,
  }: IMembershipUpdateVariables) => {
    await mutation.mutateAsync({ userPk, branch, business_area, affiliation });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col h-full ${colorMode === "dark" ? "bg-gray-800 text-gray-400" : "bg-white"}`}>
          <DialogHeader>
            <DialogTitle>Edit Membership</DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            <div className="my-2 mb-4 select-none hidden">
              <Input
                type="hidden"
                {...register("userPk", { required: true, value: userId })}
                readOnly
              />
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {/* Organisation */}
              <div className="my-2 mb-4 select-none">
                <Label>Organisation</Label>
                <Select disabled defaultValue="dbca">
                  <SelectTrigger>
                    <SelectValue placeholder="Department of Biodiversity, Conservation and Attractions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dbca">
                      Department of Biodiversity, Conservation and Attractions
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Affiliation */}
              <div className="my-2 mb-4 select-none">
                <AffiliationCreateSearchDropdown
                  isRequired={false}
                  preselectedAffiliationPk={currentAffiliationData?.pk}
                  setterFunction={(
                    selectedAffiliation: IAffiliation | undefined,
                  ) => {
                    if (selectedAffiliation) {
                      setValue("affiliation", selectedAffiliation.pk);
                    } else {
                      setValue("affiliation", undefined); // Clear the affiliation in the form
                    }
                  }}
                  isEditable
                  hideTags
                  label="Affiliation"
                  placeholder="Search for or an affiliation"
                  helperText="The entity this user is affiliated with"
                />
              </div>

              {/* Branch */}
              <div className="my-2 mb-4 select-none">
                <Label>Branch</Label>
                {!branchesLoading && branchesData && (
                  <Select
                    defaultValue={String(currentBranchData?.pk) || ""}
                    {...register("branch")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchesData.map((branch: IBranch, index: number) => {
                        return (
                          <SelectItem key={index} value={String(branch.pk)}>
                            {branch.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Business Area */}
              <div className="my-2 mb-4 select-none">
                <Label>Business Area</Label>
                {!baLoading && baData && (
                  <Select
                    defaultValue={String(currentBaData?.pk) || ""}
                    {...register("business_area")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Business Area" />
                    </SelectTrigger>
                    <SelectContent>
                      {baData.map((ba: IBusinessArea, index: number) => {
                        return (
                          <SelectItem key={index} value={String(ba.pk)}>
                            {ba.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              disabled={mutation.isPending}
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white ml-3"
            >
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
