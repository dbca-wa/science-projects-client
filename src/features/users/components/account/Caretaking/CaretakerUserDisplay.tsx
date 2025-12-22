import { RemoveCaretakerModal } from "@/features/users/components/modals/RemoveCaretakerModal";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import type { ICaretakerObject, ICaretakerSimpleUserData } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { type FC, type ReactNode } from "react";

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

      <Flex
        className="items-center justify-between gap-4 py-2"
        key={caretakee.email}
      >
        <Flex className="items-center gap-4">
          <Avatar
            size="md"
            name={`${caretakee.display_first_name} ${caretakee.display_last_name}`}
            src={
              caretakee.image
                ? caretakee.image?.startsWith("http")
                  ? `${caretakee.image}`
                  : `${baseAPI}${caretakee.image}`
                : noImage
            }
          />
          <Text
            fontSize={"md"}
            fontWeight={"semibold"}
            color={colorMode === "light" ? "gray.800" : "gray.200"}
          >
            {caretakee.display_first_name} {caretakee.display_last_name}
          </Text>
        </Flex>
        <Button
          onClick={onOpenRemoveModal}
          color={"white"}
          background={colorMode === "light" ? "red.500" : "red.600"}
          _hover={{
            background: colorMode === "light" ? "red.400" : "red.500",
          }}
        >
          Remove
        </Button>
      </Flex>
    </>
  );
};

export default CaretakerUserDisplay;
