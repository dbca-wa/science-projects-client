// Modal designed to send out emails seeking endorsement on the project plan where required
// Will send an email out to users marked as is_biometrician, is_herb_curator, or is_aec

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { deleteAECPDFEndorsement } from "@/features/projects/services/projects.service";

interface Props {
  projectPlanPk: number;
  isOpen: boolean;
  onClose: () => void;
  refetchEndorsements: () => void;
  setToggle: () => void;
}

export const DeletePDFEndorsementModal = ({
  projectPlanPk,
  isOpen,
  onClose,
  refetchEndorsements,
  setToggle,
}: Props) => {
  const deleteAECPDFEndorsementMutation = useMutation({
    mutationFn: deleteAECPDFEndorsement,
    onMutate: () => {
      toast.loading("Updating Endorsements...");
    },
    onSuccess: async () => {
      toast.success("Success", {
        description: "Updated Endorsements",
      });

      setTimeout(() => {
        refetchEndorsements();
        setToggle();
        onClose();
      }, 350);
    },
    onError: (error) => {
      toast.error("Could Not Update Endorsements", {
        description: `${error}`,
      });
    },
  });

  const onDeleteAECPDFAndApproval = () => {
    deleteAECPDFEndorsementMutation.mutate(projectPlanPk);
  };

  const { colorMode } = useColorMode();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "bg-white"}`}>
        <DialogHeader>
          <DialogTitle>Delete AEC PDF?</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <p className="font-semibold text-lg">
            Note that this will remove the AEC approval.
          </p>
        </div>

        <DialogFooter>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              disabled={deleteAECPDFEndorsementMutation.isPending}
              className={`text-white ${
                colorMode === "light" 
                  ? "bg-red-500 hover:bg-red-400" 
                  : "bg-red-600 hover:bg-red-500"
              }`}
              onClick={() => onDeleteAECPDFAndApproval()}
            >
              {deleteAECPDFEndorsementMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
