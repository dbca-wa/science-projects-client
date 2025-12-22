import { CancelCaretakerRequestModal } from "@/features/users/components/modals/CancelCaretakerRequestModal";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import type { ICaretakerSubsections } from "@/shared/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useState } from "react";
import { formatDate } from "date-fns";

const BecomeCaretakerRequestDisplay = ({
  userData,
  caretakerData,
  refetchCaretakerData,
}: ICaretakerSubsections) => {
  const { colorMode } = useColorMode();
  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();

  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const onCancelModalOpen = () => setCancelModalIsOpen(true);
  const onCancelModalClose = () => setCancelModalIsOpen(false);

  return (
    <>
      <div>
        <p className="text-red-500 mt-4 text-base">
          You have an active request to become a user's caretaker. Please wait
          for admin approval or cancel your request:
        </p>
        <div className="flex justify-between my-4 items-center">
          <div className="flex items-center gap-2">
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={
                  caretakerData?.become_caretaker_request_object?.primary_user
                    ?.image
                    ? caretakerData?.become_caretaker_request_object?.primary_user?.image?.file?.startsWith(
                        "http",
                      )
                      ? `${caretakerData?.become_caretaker_request_object?.primary_user?.image?.file}`
                      : `${baseAPI}${caretakerData?.become_caretaker_request_object?.primary_user?.image?.file}`
                    : caretakerData?.become_caretaker_request_object?.primary_user
                          ?.image?.old_file
                      ? caretakerData?.become_caretaker_request_object
                          ?.primary_user?.image?.old_file
                      : noImage
                }
              />
              <AvatarFallback>
                {caretakerData?.become_caretaker_request_object?.primary_user?.display_first_name?.[0]}
                {caretakerData?.become_caretaker_request_object?.primary_user?.display_last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p
                className={`text-base font-semibold ${
                  colorMode === "light" ? "text-gray-800" : "text-gray-200"
                }`}
              >
                {`${
                  caretakerData?.become_caretaker_request_object?.primary_user
                    ?.display_first_name
                } ${
                  caretakerData?.become_caretaker_request_object?.primary_user
                    .display_last_name
                }`}
              </p>
              <p className="text-sm text-gray-500">
                Requested on{" "}
                {formatDate(
                  caretakerData?.become_caretaker_request_object?.created_at,
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
          taskPk={caretakerData?.become_caretaker_request_object?.id}
        />
      </div>
    </>
  );
};

export default BecomeCaretakerRequestDisplay;
