import { CancelCaretakerRequestModal } from "@/features/users/components/modals/CancelCaretakerRequestModal";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import type { ICaretakerSubsections } from "@/shared/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useState } from "react";
import { formatDate } from "date-fns";

const CaretakerRequestDisplay = ({
  userData,
  caretakerData,
  refetchCaretakerData,
}: ICaretakerSubsections) => {
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const onCancelModalOpen = () => setCancelModalIsOpen(true);
  const onCancelModalClose = () => setCancelModalIsOpen(false);
  
  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();
  const { colorMode } = useColorMode();

  return (
    <div>
      <p className="text-red-500 mt-4 text-base">
        You have an active caretaker request. Please wait for admin approval or
        cancel your request:
      </p>
      <div className="flex justify-between mt-4 items-center">
        <div className="flex items-center gap-2">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={
                caretakerData?.caretaker_request_object?.secondary_users[0]?.image
                  ? caretakerData?.caretaker_request_object?.secondary_users[0]?.image?.file?.startsWith(
                      "http",
                    )
                    ? `${caretakerData?.caretaker_request_object?.secondary_users[0]?.image?.file}`
                    : `${baseAPI}${caretakerData?.caretaker_request_object?.secondary_users[0]?.image?.file}`
                  : caretakerData?.caretaker_request_object?.secondary_users[0]
                        ?.image?.old_file
                    ? caretakerData?.caretaker_request_object?.secondary_users[0]
                        ?.image?.old_file
                    : noImage
              }
            />
            <AvatarFallback>
              {caretakerData?.caretaker_request_object?.secondary_users[0]?.display_first_name?.[0]}
              {caretakerData?.caretaker_request_object?.secondary_users[0]?.display_last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p
              className={`text-base font-semibold ${
                colorMode === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              {`${
                caretakerData?.caretaker_request_object?.secondary_users[0]
                  ?.display_first_name
              } ${
                caretakerData?.caretaker_request_object?.secondary_users[0]
                  ?.display_last_name
              }`}
            </p>
            <p className="text-sm text-gray-500">
              Requested on{" "}
              {formatDate(
                caretakerData?.caretaker_request_object?.created_at,
                "dd/MM/yyyy",
              )}
            </p>
          </div>
        </div>

        <div className="flex">
          <Button onClick={onCancelModalOpen}>Cancel</Button>
        </div>
      </div>
      <CancelCaretakerRequestModal
        isOpen={cancelModalIsOpen}
        onClose={onCancelModalClose}
        refresh={refetchCaretakerData}
        taskPk={caretakerData?.caretaker_request_object?.id}
      />
    </div>
  );
};

export default CaretakerRequestDisplay;
