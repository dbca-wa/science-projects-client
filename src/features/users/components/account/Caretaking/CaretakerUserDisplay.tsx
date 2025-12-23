import { RemoveCaretakerModal } from "@/features/users/components/modals/RemoveCaretakerModal";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import type { ICaretakerObject, ICaretakerSimpleUserData } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";

const CaretakerUserDisplay = ({
  caretakerObject,
  refetchCaretakerData,
  direct,
}: {
  caretakerObject: ICaretakerObject;
  refetchCaretakerData?: () => void;
  direct: boolean;
}) => {
  const { colorMode } = useColorMode();
  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();

  const [removeModalIsOpen, setRemoveModalIsOpen] = useState(false);

  const onRemoveModalClose = () => setRemoveModalIsOpen(false);
  const onOpenRemoveModal = () => setRemoveModalIsOpen(true);

  console.log(caretakerObject);
  const caretakee = caretakerObject.user as ICaretakerSimpleUserData;

  return (
    <>
      <RemoveCaretakerModal
        isOpen={removeModalIsOpen}
        onClose={onRemoveModalClose}
        refetch={refetchCaretakerData}
        caretakerObject={caretakerObject}
      />

      <div
        className="flex items-center justify-between gap-4 py-2"
        key={caretakee.email}
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                caretakee.image
                  ? caretakee.image?.startsWith("http")
                    ? `${caretakee.image}`
                    : `${baseAPI}${caretakee.image}`
                  : noImage
              }
              alt={`${caretakee.display_first_name} ${caretakee.display_last_name}`}
            />
            <AvatarFallback>
              {caretakee.display_first_name?.[0]}{caretakee.display_last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <p className={`text-base font-semibold ${colorMode === "light" ? "text-gray-800" : "text-gray-200"}`}>
            {caretakee.display_first_name} {caretakee.display_last_name}
          </p>
        </div>
        <Button
          onClick={onOpenRemoveModal}
          className={`text-white ${
            colorMode === "light" 
              ? "bg-red-500 hover:bg-red-400" 
              : "bg-red-600 hover:bg-red-500"
          }`}
        >
          Remove
        </Button>
      </div>
    </>
  );
};

export default CaretakerUserDisplay;
