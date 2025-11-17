import { ExtendCaretakerModal } from "@/shared/components/Modals/Caretakers/ExtendCaretakerModal";
import { RemoveCaretakerModal } from "@/shared/components/Modals/Caretakers/RemoveCaretakerModal";
import useApiEndpoint from "@/shared/hooks/helper/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/helper/useNoImage";
import { checkIfDateExpired } from "@/shared/utils/checkIfDateExpired";
import type { ICaretakerSubsections } from "@/shared/types/index.d";
import {
  Avatar,
  Box,
  Button,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { formatDate } from "date-fns";

const ActiveCaretakerDisplay = ({
  userData,
  caretakerData,
  refetchCaretakerData,
}: ICaretakerSubsections) => {
  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();

  const { colorMode } = useColorMode();

  const {
    isOpen: removeModalIsOpen,
    onOpen: onOpenRemoveModal,
    onClose: onRemoveModalClose,
  } = useDisclosure();

  const {
    isOpen: extendModalIsOpen,
    onOpen: onOpenExtendModal,
    onClose: onExtendModalClose,
  } = useDisclosure();

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
            <Text color={"red.500"} fontSize={"md"} fontWeight={"semibold"}>
              You have an active caretaker.
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                size="md"
                name={`${caretakerData?.caretaker_object?.caretaker?.display_first_name} ${caretakerData?.caretaker_object?.caretaker?.display_last_name}`}
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
              <Box display={"flex"} flexDir={"column"}>
                <Text
                  fontSize={"md"}
                  fontWeight={"semibold"}
                  color={colorMode === "light" ? "gray.800" : "gray.200"}
                >
                  {
                    caretakerData?.caretaker_object?.caretaker
                      ?.display_first_name
                  }{" "}
                  {
                    caretakerData?.caretaker_object?.caretaker
                      ?.display_last_name
                  }
                </Text>
                {caretakerData?.caretaker_object?.end_date && (
                  <Text fontSize={"sm"} color={"gray.500"}>
                    {isExpiredCaretakerDate
                      ? `(Expired)`
                      : `Ends ${formatDate(
                          caretakerData?.caretaker_object?.end_date,
                          "dd/MM/yyyy",
                        )}
                   `}
                  </Text>
                )}
              </Box>
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
                    isDisabled={checkIfDateExpired(
                      caretakerData?.caretaker_object?.end_date,
                    )}
                    color={"white"}
                    background={
                      colorMode === "light" ? "green.500" : "green.600"
                    }
                    _hover={{
                      background:
                        colorMode === "light" ? "green.400" : "green.500",
                    }}
                    // isLoading={removeCaretakerMutation.isPending}
                    ml={3}
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
                color={"white"}
                background={colorMode === "light" ? "red.500" : "red.600"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }}
                // isLoading={removeCaretakerMutation.isPending}
                ml={3}
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
