import { CancelCaretakerRequestModal } from "@/shared/components/Modals/Caretakers/CancelCaretakerRequestModal";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import type { ICaretakerSubsections } from "@/shared/types/index.d";
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

const CaretakerRequestDisplay = ({
  userData,
  caretakerData,
  refetchCaretakerData,
}: ICaretakerSubsections) => {
  const {
    isOpen: cancelModalIsOpen,
    onOpen: onCancelModalOpen,
    onClose: onCancelModalClose,
  } = useDisclosure();
  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();
  const { colorMode } = useColorMode();

  return (
    <div>
      <Text color={"red.500"} mt={4} fontSize={"md"}>
        You have an active caretaker request. Please wait for admin approval or
        cancel your request:
      </Text>
      <Flex justifyContent={"space-between"} mt={4} alignItems={"center"}>
        <Box display={"flex"} alignItems={"center"} gap={2}>
          <Avatar
            size="md"
            name={`${caretakerData?.caretaker_request_object?.secondary_users[0]?.display_first_name} ${caretakerData?.caretaker_request_object?.secondary_users[0]?.display_last_name}`}
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
          <Box display={"flex"} flexDir={"column"}>
            <Text
              fontSize={"md"}
              fontWeight={"semibold"}
              color={colorMode === "light" ? "gray.800" : "gray.200"}
            >
              {`${
                caretakerData?.caretaker_request_object?.secondary_users[0]
                  ?.display_first_name
              } ${
                caretakerData?.caretaker_request_object?.secondary_users[0]
                  ?.display_last_name
              }`}
            </Text>
            <Text fontSize={"sm"} color={"gray.500"}>
              Requested on{" "}
              {formatDate(
                caretakerData?.caretaker_request_object?.created_at,
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
        taskPk={caretakerData?.caretaker_request_object?.id}
      />
    </div>
  );
};

export default CaretakerRequestDisplay;
