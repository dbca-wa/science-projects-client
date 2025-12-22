import { ExtendCaretakerModal } from "@/features/users/components/modals/ExtendCaretakerModal";
import { RemoveCaretakerModal } from "@/features/users/components/modals/RemoveCaretakerModal";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import { checkIfDateExpired } from "@/shared/utils/checkIfDateExpired";
import { useColorMode } from "@/shared/utils/theme.utils";
import type { ICaretakerSubsections } from "@/shared/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { formatDate } from "date-fns";
import { useState } from "react";

const ActiveCaretakerDisplay = ({
  userData,
  caretakerData,
  refetchCaretakerData,
}: ICaretakerSubsections) => {
  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();

  const { colorMode } = useColorMode();

  const [removeModalIsOpen, setRemoveModalIsOpen] = useState(false);
  const onOpenRemoveModal = () => setRemoveModalIsOpen(true);
  const onRemoveModalClose = () => setRemoveModalIsOpen(false);

  const [extendModalIsOpen, setExtendModalIsOpen] = useState(false);
  const onOpenExtendModal = () => setExtendModalIsOpen(true);
  const onExtendModalClose = () => setExtendModalIsOpen(false);

  const isExpiredCaretakerDate = checkIfDateExpired(
    caretakerData?.caretaker_object?.end_date,
  );

  return (
    <>
      {/* Actual Caretaker */}
      {caretakerData?.caretaker_object !== null && (
        <>
          <RemoveCaretakerModal
            isOpen={removeModalIsOpen}
            onClose={onRemoveModalClose}
            refetch={refetchCaretakerData}
            caretakerObject={caretakerData?.caretaker_object}
          />
          <div className="my-4">
            <p className="text-red-500 text-md font-semibold">
              You have an active caretaker.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={
                    caretakerData?.caretaker_object?.caretaker?.image
                      ? caretakerData?.caretaker_object?.caretaker?.image?.file?.startsWith(
                          "http",
                        )
                        ? `${caretakerData?.caretaker_object?.caretaker?.image?.file}`
                        : `${baseAPI}${caretakerData?.caretaker_object?.caretaker?.image?.file}`
                      : caretakerData?.caretaker_object?.caretaker?.image
                            ?.old_file
                        ? caretakerData?.caretaker_object?.caretaker?.image
                            ?.old_file
                        : noImage
                  }
                />
                <AvatarFallback>
                  {`${caretakerData?.caretaker_object?.caretaker?.display_first_name} ${caretakerData?.caretaker_object?.caretaker?.display_last_name}`}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className={`text-md font-semibold ${
                  colorMode === "light" ? "text-gray-800" : "text-gray-200"
                }`}>
                  {
                    caretakerData?.caretaker_object?.caretaker
                      ?.display_first_name
                  }{" "}
                  {
                    caretakerData?.caretaker_object?.caretaker
                      ?.display_last_name
                  }
                </p>
                {caretakerData?.caretaker_object?.end_date && (
                  <p className="text-sm text-gray-500">
                    {isExpiredCaretakerDate
                      ? `(Expired)`
                      : `Ends ${formatDate(
                          caretakerData?.caretaker_object?.end_date,
                          "dd/MM/yyyy",
                        )}
                   `}
                  </p>
                )}
              </div>
            </div>
            <div>
              {/* Button to extend the end date of the caretaker, if the end date has passed */}
              {caretakerData?.caretaker_object?.end_date && (
                <>
                  <ExtendCaretakerModal
                    isOpen={extendModalIsOpen}
                    onClose={onExtendModalClose}
                    refetch={refetchCaretakerData}
                    caretakerObject={caretakerData?.caretaker_object}
                  />
                  <Button
                    disabled={checkIfDateExpired(
                      caretakerData?.caretaker_object?.end_date,
                    )}
                    className={`text-white ml-3 ${
                      colorMode === "light" 
                        ? "bg-green-500 hover:bg-green-400" 
                        : "bg-green-600 hover:bg-green-500"
                    }`}
                    onClick={() => {
                      onOpenExtendModal();
                    }}
                  >
                    Extend
                  </Button>
                </>
              )}

              {/* Button to remove the caretaker completely */}
              <Button
                className={`text-white ml-3 ${
                  colorMode === "light" 
                    ? "bg-red-500 hover:bg-red-400" 
                    : "bg-red-600 hover:bg-red-500"
                }`}
                onClick={() => {
                  onOpenRemoveModal();
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ActiveCaretakerDisplay;
