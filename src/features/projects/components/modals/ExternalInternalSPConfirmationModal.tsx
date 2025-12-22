// Modal designed to send out emails seeking endorsement on the project plan where required
// Will send an email out to users marked as is_biometrician, is_herb_curator, or is_aec

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mutationFunction: () => void;
  isExternalSP: boolean;
  setIsExternalSP: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ExternalInternalSPConfirmationModal = ({
  isOpen,
  onClose,
  mutationFunction,
  isExternalSP,
  setIsExternalSP,
}: Props) => {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const { colorMode } = useColorMode();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      }`}>
        <DialogHeader>
          <DialogTitle>Is this an externally led project?</DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <div className="mt-6 flex flex-col items-center">
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="external-project"
                  checked={isExternalSP}
                  onCheckedChange={() => setIsExternalSP((prev) => !prev)}
                />
                <label htmlFor="external-project" className="text-sm font-medium">
                  Yes, this is an externally led project
                </label>
              </div>
            </div>
            {isExternalSP ? (
              <div className="my-4">
                <p className="text-blue-500">
                  As this is an externally led project, a concept plan will
                  NOT be created.{" "}
                </p>
                <p className="text-blue-500">
                  Instead a project plan will be created.
                </p>
              </div>
            ) : (
              <div className="my-4">
                <p className="text-blue-500">
                  As this is not an externally led project, a concept plan
                  will be created.
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              className={`text-white ${
                colorMode === "light" 
                  ? "bg-green-500 hover:bg-green-400" 
                  : "bg-green-600 hover:bg-green-500"
              }`}
              disabled={buttonDisabled}
              onClick={async () => {
                setButtonDisabled(true);
                await mutationFunction();
                setButtonDisabled(false);
                onClose();
              }}
            >
              Create
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
