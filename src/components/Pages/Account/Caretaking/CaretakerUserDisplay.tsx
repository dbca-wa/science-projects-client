import { RemoveCaretakerModal } from "@/components/Modals/Caretakers/RemoveCaretakerModal";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";
import { ICaretakerObject, ICaretakerSimpleUserData } from "@/types";
import {
  Avatar,
  Button,
  Flex,
  useColorMode,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";

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

  const {
    isOpen: removeModalIsOpen,
    onOpen: onOpenRemoveModal,
    onClose: onRemoveModalClose,
  } = useDisclosure();

  console.log(caretakerObject);
  const caretakee: ICaretakerSimpleUserData = caretakerObject.user;

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
