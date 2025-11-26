import { CancelCaretakerRequestModal } from "@/features/users/components/modals/CancelCaretakerRequestModal";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import type { ICaretakerSubsections } from "@/shared/types";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { formatDate } from "date-fns";

const BecomeCaretakerRequestDisplay = ({
  userData,
  caretakerData,
  refetchCaretakerData,
}: ICaretakerSubsections) => {
  const { colorMode } = useColorMode();
  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();

  const {
    isOpen: cancelModalIsOpen,
    onOpen: onCancelModalOpen,
    onClose: onCancelModalClose,
  } = useDisclosure();

  return (
    <>
      <div>
        <Text color={"red.500"} mt={4} fontSize={"md"}>
          You have an active request to become a user's caretaker. Please wait
          for admin approval or cancel your request:
        </Text>
        <Flex justifyContent={"space-between"} my={4} alignItems={"center"}>
          <Box display={"flex"} alignItems={"center"} gap={2}>
            <Avatar
              size="md"
              name={`${caretakerData?.become_caretaker_request_object?.primary_user?.display_first_name} ${caretakerData?.become_caretaker_request_object?.primary_user?.display_last_name}`}
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
            <Box display={"flex"} flexDir={"column"}>
              <Text
                fontSize={"md"}
                fontWeight={"semibold"}
                color={colorMode === "light" ? "gray.800" : "gray.200"}
              >
                {`${
                  caretakerData?.become_caretaker_request_object?.primary_user
                    ?.display_first_name
                } ${
                  caretakerData?.become_caretaker_request_object?.primary_user
                    .display_last_name
                }`}
              </Text>
              <Text fontSize={"sm"} color={"gray.500"}>
                Requested on{" "}
                {formatDate(
                  caretakerData?.become_caretaker_request_object?.created_at,
                  "dd/MM/yyyy",
                )}
              </Text>
            </Box>
          </Box>

          <Flex>
            <Button onClick={onCancelModalOpen}>Cancel</Button>
          </Flex>
        </Flex>
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
