// Modal designed to send out emails seeking endorsement on the project plan where required
// Will send an email out to users marked as is_biometrician, is_herb_curator, or is_aec

import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { type ISpecialEndorsement, seekEndorsementAndSave } from "@/features/projects/services/projects.service";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface Props {
  projectPlanPk: number;
  aecEndorsementRequired: boolean;
  aecEndorsementProvided: boolean;
  aecPDFFile: File;
  isOpen: boolean;
  onClose: () => void;
  refetchEndorsements: () => void;
}

export const SeekEndorsementModal = ({
  projectPlanPk,
  aecEndorsementRequired,
  aecEndorsementProvided,
  aecPDFFile,
  isOpen,
  onClose,
  refetchEndorsements,
}: Props) => {
  const [shouldSendEmails, setShouldSendEmails] = useState(false);
  // Mutation, query client, onsubmit, and api function

  const seekEndorsementAndSaveMutation = useMutation({
    mutationFn: seekEndorsementAndSave,
    onMutate: () => {
      toast.loading(shouldSendEmails ? `Sending Emails` : `Updating Endorsements`);
    },
    onSuccess: async () => {
      toast.success(shouldSendEmails ? `Emails Sent` : `Updated Endorsements`);
      setTimeout(() => {
        refetchEndorsements();
        onClose();
      }, 350);
    },
    onError: (error) => {
      toast.error(shouldSendEmails
        ? `Could Not Send Emails: ${error}`
        : `Could Not Update Endorsements: ${error}`);
    },
  });

  const seekEndorsementAndSaveFunc = (formData: ISpecialEndorsement) => {
    seekEndorsementAndSaveMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save Endorsements</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <p className="font-semibold text-lg">
            {
              // AEC not required or AEC required and given
              aecEndorsementRequired === false ||
              (aecEndorsementRequired === true &&
                aecEndorsementProvided === true)
                ? "As all required endorsements have been provided, no emails are necessary. You may still save."
                : "Also send notifications?"
            }
          </p>
          <div className="flex mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-notifications"
                checked={shouldSendEmails}
                onCheckedChange={() => setShouldSendEmails(!shouldSendEmails)}
                disabled={
                  !aecEndorsementRequired ||
                  (aecEndorsementRequired && aecEndorsementProvided)
                }
              />
              <Label htmlFor="send-notifications">Send Notifications</Label>
            </div>
          </div>
        </div>
        
        {shouldSendEmails && (
          <div className="mt-8 flex justify-center">
            <ul className="list-disc list-inside space-y-2">
              {/* IF involves animals */}
              {/* AND AEC endorsement required and not provided */}
              {aecEndorsementRequired === true &&
                aecEndorsementProvided === false && (
                  <li className="text-blue-400">
                    As Animal Ethics Committee endorsement is marked as
                    required but it has yet to be provided, an email will be
                    sent to Animal Ethics Committee approvers to approve or
                    reject this plan
                  </li>
                )}
              {/* ELSE where AEC endorsement not required */}
              {aecEndorsementRequired === false && (
                <li className="text-gray-400">
                  As Animal Ethics Committee endorsement is marked as not
                  required, no email will be sent to Animal Ethics Committee
                  approvers
                </li>
              )}
            </ul>
          </div>
        )}

        {aecPDFFile && (
          <div className="mt-8">
            <p className="text-green-500">
              You are uploading the following file to provide AEC approval:
            </p>
            <div className="flex mt-6 min-h-[40px] items-center">
              <div>
                <img className="max-h-[40px]" src="/pdf2.png" alt="PDF" />
              </div>
              <div className="ml-4 flex flex-1 min-h-[40px] items-center">
                <p className={colorMode === "light" ? "text-gray-800" : "text-gray-300"}>
                  {aecPDFFile.name}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              className={`text-white ${
                colorMode === "light" 
                  ? "bg-blue-500 hover:bg-blue-400" 
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
              disabled={
                seekEndorsementAndSaveMutation.isPending ||
                (shouldSendEmails &&
                  (aecEndorsementRequired === false ||
                    (aecEndorsementRequired === true &&
                      aecEndorsementProvided === true)))
              }
              onClick={() => {
                if (aecPDFFile !== undefined) {
                  seekEndorsementAndSaveFunc({
                    aecEndorsementRequired,
                    aecEndorsementProvided,
                    aecPDFFile,
                    shouldSendEmails,
                    projectPlanPk,
                  });
                } else {
                  seekEndorsementAndSaveFunc({
                    aecEndorsementRequired,
                    aecEndorsementProvided,
                    shouldSendEmails,
                    projectPlanPk,
                  });
                }
              }}
            >
              {shouldSendEmails ? `Save and Send Emails` : `Save`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
